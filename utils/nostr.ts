// this is needed to polyfill TextDecoder which nostr-tools uses
import "fast-text-encoding";

// // this is needed to polyfill crypto.getRandomValues which nostr-tools uses
import "react-native-get-random-values";

// this is needed to polyfill crypto.subtle which nostr-tools uses
import "react-native-webview-crypto";

// fix for MessageChannel in nostr-tools
// https://github.com/nbd-wtf/nostr-tools/issues/374
import "message-port-polyfill";

// import "./nostr-tools-fix";
import {
  nip19,
  Relay,
  Filter,
  Event,
  finalizeEvent,
  EventTemplate,
  nip57,
  utils,
  nip04,
  getPublicKey,
  VerifiedEvent,
} from "nostr-tools";

// TODO: remove base64, sha256, and bytesToHex once getAuthToken copy pasta is removed
import { base64 } from "@scure/base";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import axios from "axios";
import { ShowEvents } from "@/constants/events";
import { getPodcastFeedGuid } from "./rss";
import { NWCRequest } from "./nwc";
import {
  deduplicateEvents,
  getAllCommentEvents,
  getLabeledEvents,
  isNotCensoredAuthor,
  removeCensoredContent,
} from "./comments";
import { getSettings } from "./cache";
import {
  DEFAULT_READ_RELAY_URIS,
  DEFAULT_WRITE_RELAY_URIS,
  PURPLE_PAGES_RELAY,
  wavlakeFeedPubkey,
} from "./shared";
import { pool } from "./relay-pool";
import { NostrUserProfile } from "./types";
import { signEvent } from "./signing";
import { parseInvoice } from "./bolts";

export { getPublicKey, generateSecretKey } from "nostr-tools";

const wavlakeRelayUri = "wss://relay.wavlake.com/";
const wavlakeTrackKind = 32123;
const ticketEventKind = 31923;
const ticketBotPublicKey =
  "1c2aa0fb7bf8ed94e0cdb1118bc1b8bd51c6bd3dbfb49b2fd93277b834c40397";
export const Contacts = 3;
const HTTPAuth = 27235;

export const encodeNpub = (pubkey: string) => {
  try {
    if (!pubkey) return null;
    return nip19.npubEncode(pubkey);
  } catch {
    return null;
  }
};

export const encodeNsec = (seckey: string) => {
  try {
    if (!seckey) return null;
    return nip19.nsecEncode(hexToBytes(seckey));
  } catch {
    return null;
  }
};

// can handle both nsec and hex private keys
export const getKeysFromNostrSecret = (secret: string | `nsec${string}`) => {
  try {
    if (secret.startsWith("nsec")) {
      if (secret.length !== 63) return;
      const seckey = decodeNsec(secret);
      const pubkey = seckey && getPublicKey(seckey);
      const npub = pubkey && encodeNpub(pubkey);

      return { nsec: secret, seckey, pubkey, npub };
    } else {
      if (secret.length !== 64) return;
      const nsec = encodeNsec(secret);
      const seckey = nsec && decodeNsec(nsec);
      const pubkey = seckey && getPublicKey(seckey);
      const npub = pubkey && encodeNpub(pubkey);

      return { seckey, pubkey, npub, nsec };
    }
  } catch {
    console.error("Failed to get keys from Nostr secret");
    return null;
  }
};

export const decodeNsec = (nsec: string) => {
  try {
    const { type, data } = nip19.decode(nsec);

    return type === "nsec" ? data : null;
  } catch {
    return null;
  }
};

export const getMostRecentEvent = (events: Event[]) => {
  return events.sort((a, b) => b.created_at - a.created_at)[0];
};

export const getEventFromRelay = (
  relayUri: string,
  filter: Filter,
): Promise<Event | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const relay = await Relay.connect(relayUri);
      const sub = relay.subscribe([filter], {
        onevent(event) {
          resolve(event);
          sub.close();
        },
      });

      // timeout after 30 seconds
      setTimeout(() => {
        sub.close();
        reject();
      }, 10000);
    } catch (e) {
      reject();
    }
  });
};

const getEventFromPool = async ({
  pubkey,
  filter,
  relayUris = DEFAULT_READ_RELAY_URIS,
}: {
  pubkey: string;
  filter: Filter;
  relayUris?: string[];
}) => {
  try {
    const event = await pool.get(relayUris, filter);

    if (event === null) {
      return null;
    }

    return event;
  } catch {
    return null;
  }
};

export const getProfileMetadata = async (
  pubkey: string,
  relayUris: string[] = DEFAULT_READ_RELAY_URIS,
) => {
  const filter = {
    kinds: [0],
    authors: [pubkey],
  };
  return getEventFromPool({
    pubkey,
    filter,
    relayUris,
  });
};

// returns a map of pubkeys to a relay where you can find their profile
export const getFollowsListMap = async (
  pubkey: string,
  relayUris: string[],
) => {
  const filter = {
    kinds: [3],
    authors: [pubkey],
  };
  const event = await getEventFromPool({
    pubkey,
    filter,
    relayUris,
  });

  if (!event) {
    return null;
  }

  const followsListMap = event.tags.reduce(
    (acc, [tag, pubkey, relay, petname]) => {
      if (tag === "p") {
        acc[pubkey] = relay;
      }
      return acc;
    },
    {} as Record<string, string>,
  );
  return followsListMap;
};

export const getNWCInfoEvent = async (pubkey: string, relayUri?: string) => {
  const filter = {
    kinds: [13194],
    authors: [pubkey],
  };

  return getEventFromPool({
    pubkey,
    filter,
    // so we have to check other relays
    relayUris: [...DEFAULT_READ_RELAY_URIS, ...(relayUri ? [relayUri] : [])],
  });
};

export const getRelayListMetadata = async (pubkey: string) => {
  const filter = {
    kinds: [10002],
    authors: [pubkey],
  };
  return getEventFromPool({
    pubkey,
    filter,
  });
};

export const publishEvent = async (relayUris: string[], event: Event) => {
  const promises = pool.publish(relayUris, event);

  // Mimic Promise.any behavior using Promise.race
  const wrappedPromises = promises.map((p) =>
    p.catch((error) => Promise.reject(error)),
  );

  return Promise.race(wrappedPromises).catch((error) => {
    // Handle the case where all promises reject
    throw new Error("All publish attempts failed");
  });
};

export const makeProfileEvent = (profile: NostrUserProfile): EventTemplate => {
  return {
    kind: 0,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: JSON.stringify(profile),
  };
};

export const makeNWCRequestEvent = async ({
  walletPubkey,
  relay,
  request,
  connectionSecret,
}: {
  walletPubkey: string;
  relay: string;
  request: NWCRequest;
  connectionSecret: string;
}): Promise<Event | void> => {
  try {
    const encryptedCommand = await nip04.encrypt(
      connectionSecret,
      walletPubkey,
      JSON.stringify(request),
    );

    if (!encryptedCommand) {
      throw new Error("Failed to encrypt NWC command");
    }

    const event: EventTemplate = {
      kind: 23194,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", walletPubkey]],
      content: encryptedCommand,
    };

    const signedEvent = await finalizeEvent(
      event,
      hexToBytes(connectionSecret),
    );

    return signedEvent;
  } catch (error) {
    console.error(error);
  }
};

export const makeRelayListEvent = (relayUris: string[]): EventTemplate => {
  return {
    kind: 10002,
    created_at: Math.floor(Date.now() / 1000),
    tags: relayUris.map((relay) => ["r", relay]),
    content: "",
  };
};

interface MakeLiveStatusEventParams {
  pubkey: string;
  trackUrl: string;
  content: string;
  duration: number;
  relayUris?: string[] | null;
}

export const publishLiveStatusEvent = async ({
  pubkey,
  trackUrl,
  content,
  duration,
  relayUris,
}: MakeLiveStatusEventParams) => {
  const { allowListeningActivity } = await getSettings(pubkey);

  if (!allowListeningActivity) {
    return;
  }

  const getNormalizedRelayUris = () => {
    const relaysToUse =
      !relayUris || relayUris.length === 0
        ? DEFAULT_WRITE_RELAY_URIS
        : relayUris;

    return relaysToUse.filter((r) => !r.startsWith(PURPLE_PAGES_RELAY));
  };
  const currentTime = Math.floor(Date.now() / 1000);
  const eventTemplate = {
    kind: 30315,
    content,
    pubkey,
    created_at: currentTime,
    tags: [
      ["d", "music"],
      ["r", trackUrl],
      ["expiration", (currentTime + duration).toString()],
    ],
  };

  try {
    const signedEvent = await signEvent(eventTemplate);
    if (!signedEvent) {
      throw new Error("Failed to sign event");
    }

    await publishEvent(getNormalizedRelayUris(), signedEvent);
  } catch (error) {
    console.error(error);
  }
};

export const getReadRelayUris = (event: Event) => {
  if (event.kind !== 10002) {
    return [];
  }

  return event.tags
    .filter(
      (tag) => tag[0] === "r" && (tag[2] === "read" || tag[2] === undefined),
    )
    .map((tag) => tag[1]);
};

export const getWriteRelayUris = (event: Event) => {
  if (event.kind !== 10002) {
    return [];
  }

  return event.tags
    .filter(
      (tag) => tag[0] === "r" && (tag[2] === "write" || tag[2] === undefined),
    )
    .map((tag) => tag[1]);
};

export const makeZapRequest = async ({
  contentId,
  parentContentId,
  parentContentType,
  amountInSats,
  relays = [],
  comment,
  timestamp,
  customTags = [],
}: {
  contentId: string;
  parentContentId: string;
  parentContentType: "podcast" | "album" | "artist";
  amountInSats: number;
  relays?: string[];
  comment: string;
  timestamp?: number;
  customTags?: EventTemplate["tags"];
}): Promise<EventTemplate> => {
  const nostrEventAddressPointer = `${wavlakeTrackKind}:${wavlakeFeedPubkey}:${contentId}`;
  const iTags = [
    ["i", `podcast:item:guid:${contentId}`],
    [
      "i",
      `podcast:guid:${getPodcastFeedGuid(parentContentType, parentContentId)}`,
    ],
    [
      "i",
      `podcast:publisher:guid:${getPodcastFeedGuid(
        parentContentType,
        parentContentId,
      )}`,
    ],
  ];
  const zapRequestEvent = await nip57.makeZapRequest({
    profile: wavlakeFeedPubkey,
    amount: amountInSats * 1000,
    relays: [wavlakeRelayUri, ...relays],
    comment,
    event: null,
  });
  zapRequestEvent.tags = [
    ...zapRequestEvent.tags,
    ["a", nostrEventAddressPointer, wavlakeRelayUri],
    ["timestamp", timestamp?.toString() ?? ""],
    ...iTags,
  ];
  return zapRequestEvent;
};

export const makeTicketZapRequest = async ({
  contentId,
  amountInSats,
  relays = [],
  comment,
  customTags = [],
}: {
  contentId: string;
  amountInSats: number;
  relays: string[];
  comment: string;
  customTags?: EventTemplate["tags"];
}): Promise<EventTemplate> => {
  const nostrEventAddressPointer = `${ticketEventKind}:${ticketBotPublicKey}:${contentId}`;

  const zapRequestEvent = await nip57.makeZapRequest({
    profile: ticketBotPublicKey,
    amount: amountInSats * 1000,
    relays: [wavlakeRelayUri, ...relays],
    comment,
    event: null,
  });
  zapRequestEvent.tags = [
    ...zapRequestEvent.tags,
    ["a", nostrEventAddressPointer, wavlakeRelayUri],
    ...customTags,
  ];
  return zapRequestEvent;
};

export const fetchInvoice = async ({
  zapRequest,
  amountInSats,
  zapEndpoint = "https://www.wavlake.com/api/zap",
}: {
  zapRequest: VerifiedEvent;
  amountInSats: number;
  zapEndpoint?: string;
}): Promise<{ pr: string } | { status: string; reason: string }> => {
  const url = `${zapEndpoint}?amount=${
    amountInSats * 1000
  }&nostr=${encodeURIComponent(JSON.stringify(zapRequest))}`;

  try {
    const { data } = await axios(url, {
      validateStatus: (status) => {
        return status < 500; // Resolve only if the status code is less than 500, else reject
      },
    });
    return data;
  } catch (error) {
    console.log("fetch invoice", error);
    return { status: "error", reason: "Failed to fetch invoice" };
  }
};

// amount is in sats
export const parseZapRequestFromReceipt = (event: Event) => {
  try {
    const [descTag, zapRequest] =
      event.tags.find((tag) => tag[0] === "description") ?? [];
    const receipt: Event = JSON.parse(zapRequest);

    const [bolt11Tag, bolt11Invoice] =
      event.tags.find((tag) => tag[0] === "bolt11") ?? [];
    const amountFromInvoice = parseInvoice(bolt11Invoice);
    return { receipt, amount: amountFromInvoice ?? 0 };
  } catch (e) {
    return { receipt: null, amount: null };
  }
};

export const getZapReceipt = async (
  invoice: string,
  relay = "wss://relay.wavlake.com",
): Promise<Event | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const relayConnection = await Relay.connect(relay);
      // seeing an API publish time that is 5 minutes behind the current time
      const offsetTime = 800;
      const since = Math.round(Date.now() / 1000) - offsetTime;
      const filter = {
        kinds: [9735],
        since,
      };
      const sub = relayConnection.subscribe([filter], {
        onevent(event) {
          const [bolt11Tag, receiptInvoice] =
            event.tags.find((tag) => tag[0] === "bolt11") || [];

          if (receiptInvoice === invoice) {
            resolve(event);
            sub.close();
          }
        },
      });
    } catch (e) {
      reject();
    }
  });
};

/**
 * Generate token for NIP-98 flow.
 * TODO: remove this copy pasta once payment tag support is added to nostr-tools.
 *
 * @example
 * const sign = window.nostr.signEvent
 * await getAuthToken('https://example.com/login', 'post', (e) => sign(e), true)
 */
export async function getAuthToken(
  loginUrl: string,
  httpMethod: string,
  sign: (e: EventTemplate) => Promise<Event>,
  includeAuthorizationScheme: boolean = false,
  payload?: Record<string, any>,
): Promise<string> {
  const _authorizationScheme = "Nostr ";

  if (!loginUrl || !httpMethod)
    throw new Error("Missing loginUrl or httpMethod");

  const event = {
    kind: HTTPAuth,
    created_at: Math.round(new Date().getTime() / 1000),
    tags: [
      ["u", loginUrl],
      ["method", httpMethod],
    ],
    content: "",
  };

  if (payload) {
    const utf8Encoder = new TextEncoder();
    event.tags.push([
      "payload",
      bytesToHex(sha256(utf8Encoder.encode(JSON.stringify(payload)))),
    ]);
  }

  const signedEvent = await sign(event);
  const authorizationScheme = includeAuthorizationScheme
    ? _authorizationScheme
    : "";
  return (
    authorizationScheme +
    base64.encode(utils.utf8Encoder.encode(JSON.stringify(signedEvent)))
  );
}

// this will only pull in the most recent ticket DM
export const subscribeToTicket = async (pubkey: string) => {
  const filter: Filter = {
    kinds: [4],
    ["#p"]: [pubkey],
    authors: ShowEvents.map((event) => event.pubkey),
  };

  return getEventFromRelay("wss://relay.wavlake.com", filter).catch((e) => {
    return null;
  });
};

export const getEventById = (
  eventId: string,
  relays: string[] = DEFAULT_READ_RELAY_URIS,
) => {
  const filter = {
    ids: [eventId],
  };

  return pool.get(relays, filter);
};

export const getKind3Event = (
  pubkey?: string,
  relays: string[] = DEFAULT_READ_RELAY_URIS,
) => {
  if (!pubkey) {
    return null;
  }

  const filter = {
    kinds: [Contacts],
    authors: [pubkey],
  };

  try {
    return pool.get(relays, filter);
  } catch {
    return null;
  }
};

export const fetchReplies = async (
  kind1EventIds: string[],
  relayList = DEFAULT_READ_RELAY_URIS,
) => {
  const filter = {
    kinds: [1],
    ["#e"]: kind1EventIds,
  };

  return pool.querySync(relayList, filter);
};

export const fetchQuoteReposts = async (
  eventId: string,
  relayList = DEFAULT_READ_RELAY_URIS,
) => {
  const filter = {
    kinds: [1],
    ["#q"]: [eventId],
  };

  return pool.querySync(relayList, filter);
};

export const fetchReposts = async (
  eventId: string,
  relayList = DEFAULT_READ_RELAY_URIS,
) => {
  const filter = {
    kinds: [6],
    "#e": [eventId],
  };
  return pool.querySync(relayList, filter);
};

export const fetchEventReactions = async (
  event: Event,
  relayList = DEFAULT_READ_RELAY_URIS,
) => {
  const filter = {
    kinds: [7],
    ["#e"]: [event.id],
    ["#p"]: [event.pubkey],
  };

  return pool.querySync(relayList, filter);
};

export const fetchContentCommentEvents = async (
  contentIds: string[],
  limit = 100,
) => {
  const { kind1Events, zapReceipts, labelEventPointers } =
    await getAllCommentEvents(contentIds, limit);

  const labeledEvents = await getLabeledEvents(labelEventPointers);

  const deduplicatedEvents = deduplicateEvents(
    kind1Events,
    zapReceipts,
    labeledEvents,
  );

  return deduplicatedEvents
    .map(removeCensoredContent)
    .filter(isNotCensoredAuthor)
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, limit);
};

export const fetchPulseFeedEvents = async (limit = 100) => {
  const zapFilter = {
    kinds: [9735, 1985],
    limit,
    authors: [wavlakeFeedPubkey],
  };

  const events = await pool.querySync(DEFAULT_READ_RELAY_URIS, zapFilter);

  const zapReceipts: Event[] = [];
  const labelEvents: Event[] = [];
  events.forEach((event) => {
    if (event.kind === 9735) {
      zapReceipts.push(event);
    } else if (event.kind === 1985) {
      labelEvents.push(event);
    }
  });

  return { zapReceipts, labelEvents };
};

const itemIdPrefix = "podcast:item:guid:";
export const getITagFromEvent = (
  event?: Event | null,
  prefix: string = itemIdPrefix,
) => {
  if (!event) {
    return null;
  }

  const iTags = event.tags.filter((tag) => tag[0] === "i") || [];
  const [_iTag, contentId] =
    iTags.find((tag) => tag[1].startsWith(prefix)) || [];

  if (!contentId) {
    return null;
  }

  return contentId.replace(prefix, "");
};

// Utility function to extract e-tags
const getETags = (event: Event): string[][] =>
  event.tags.filter(([tag]) => tag === "e");

// Check for a specific marked tag
// ["e", <event-id>, <relay-url>, <marker>, <pubkey>]
const hasMarkedTag = (
  event: Event,
  marker: string,
  eventId?: string,
): boolean =>
  getETags(event).some(
    ([, tagId, , tagMarker]) =>
      tagMarker === marker && (eventId ? tagId === eventId : true),
  );

// Check for root tag
export const hasRootTag = (event: Event, eventId?: string): boolean =>
  hasMarkedTag(event, "root", eventId);

// Check for reply tag
export const hasReplyTag = (event: Event, eventId?: string): boolean =>
  hasMarkedTag(event, "reply", eventId);

// Check if event is a root reply
export const isRootReply = (event: Event, eventId?: string): boolean =>
  hasRootTag(event, eventId) && !hasReplyTag(event);

// Get mention tag
const getMentionTag = (event: Event): string | null => {
  const mentionTag = getETags(event).find(
    ([, , , marker]) => marker === "mention",
  );
  return mentionTag ? mentionTag[1] : null;
};

// Determine parent event ID for replies (kind 1 only)
export const getParentEventId = (event: Event): string | null => {
  // Strategy 1: Explicit reply tag
  const replyTag = getETags(event).find(([, , , marker]) => marker === "reply");
  if (replyTag) return replyTag[1];

  // Strategy 2: Root reply
  if (isRootReply(event)) {
    const rootTag = getETags(event).find(([, , , marker]) => marker === "root");
    if (rootTag) return rootTag[1];
  }

  // Strategy 3: Mention tag
  const mentionEventId = getMentionTag(event);
  if (mentionEventId) return mentionEventId;

  // Strategy 4: Positional e-tags
  const eTags = getETags(event);
  if (eTags.length === 0) return null;
  if (eTags.length === 1) return eTags[0][1];

  // Multiple tags - last one is reply-to event
  return eTags[eTags.length - 1][1];
};
