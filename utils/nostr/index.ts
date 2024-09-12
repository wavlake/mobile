// this is needed to polyfill TextDecoder which nostr-tools uses
import "fast-text-encoding";

// this is needed to polyfill crypto.getRandomValues which nostr-tools uses
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
  generateSecretKey,
  utils,
  nip04,
  SimplePool,
} from "nostr-tools";

// TODO: remove base64, sha256, and bytesToHex once getAuthToken copy pasta is removed
import { base64 } from "@scure/base";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import axios from "axios";
import {
  cacheNWCInfoEvent,
  cacheNostrProfileEvent,
  cacheNostrRelayListEvent,
  getCachedNWCInfoEvent,
  getCachedNostrProfileEvent,
  getCachedNostrRelayListEvent,
  getSettings,
} from "@/utils/cache";
import { getSeckey } from "@/utils/secureStorage";
import { ShowEvents } from "@/constants/events";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "@/components";
import { useAuth } from "@/hooks";
import { updatePubkeyMetadata } from "../api";
import { getPodcastFeedGuid } from "../rss";
import { NWCRequest } from "../nwc";
import {
  deduplicateEvents,
  getAllCommentEvents,
  getLabeledEvents,
  isNotCensoredAuthor,
  removeCensoredContent,
} from "./comments";

export { getPublicKey, generateSecretKey } from "nostr-tools";

export const wavlakeZapPubkey =
  process.env.EXPO_PUBLIC_WALLET_SERVICE_PUBKEY ?? "";
const wavlakeRelayUri = "wss://relay.wavlake.com/";
const wavlakeTrackKind = 32123;
const ticketEventKind = 31923;
const ticketBotPublicKey =
  "1c2aa0fb7bf8ed94e0cdb1118bc1b8bd51c6bd3dbfb49b2fd93277b834c40397";
const Contacts = 3;
const HTTPAuth = 27235;
export const DEFAULT_READ_RELAY_URIS = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://relay.damus.io",
  "wss://nostr.wine",
  "wss://relay.snort.social",
  "wss://relay.wavlake.com",
];

export const DEFAULT_WRITE_RELAY_URIS = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://relay.damus.io",
  "wss://relay.wavlake.com",
  "wss://nostr.mutinywallet.com",
];

export const pool = new SimplePool();

export const encodeNpub = (pubkey: string) => {
  try {
    return nip19.npubEncode(pubkey);
  } catch {
    return null;
  }
};

export const encodeNsec = (seckey: string) => {
  try {
    return nip19.nsecEncode(hexToBytes(seckey));
  } catch {
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

const getEventFromPoolAndCacheItIfNecessary = async ({
  pubkey,
  filter,
  cachedEvent,
  cache,
  relayUris = DEFAULT_READ_RELAY_URIS,
}: {
  pubkey: string;
  filter: Filter;
  cachedEvent: Event | null;
  cache: Function;
  relayUris?: string[];
}) => {
  try {
    const event = await pool.get(relayUris, filter);

    if (event === null) {
      return null;
    }

    if (!cachedEvent || event.created_at > cachedEvent.created_at) {
      await cache(pubkey, event);
    }

    return event;
  } catch {
    return null;
  }
};

export const getProfileMetadata = async (
  pubkey: string,
  relayUris: string[],
) => {
  const filter = {
    kinds: [0],
    authors: [pubkey],
  };
  return getEventFromPoolAndCacheItIfNecessary({
    pubkey,
    filter,
    cachedEvent: await getCachedNostrProfileEvent(pubkey),
    cache: cacheNostrProfileEvent,
    relayUris,
  });
};

export const batchGetProfileMetadata = async (
  pubkeys: string[],
  relayUris: string[],
) => {
  const filter = {
    kinds: [0],
    authors: pubkeys,
  };
  return pool.querySync(relayUris, filter);
};

export const getNWCInfoEvent = async (pubkey: string, relayUri?: string) => {
  const filter = {
    kinds: [13194],
    authors: [pubkey],
  };

  return getEventFromPoolAndCacheItIfNecessary({
    pubkey,
    filter,
    cachedEvent: await getCachedNWCInfoEvent(pubkey),
    cache: cacheNWCInfoEvent,
    // mutiny wallet doesn't allow us to read from the relay specificed in the NWC info event
    // so we have to check other relays
    relayUris: [...DEFAULT_READ_RELAY_URIS, ...(relayUri ? [relayUri] : [])],
  });
};

export const getRelayListMetadata = async (pubkey: string) => {
  const filter = {
    kinds: [10002],
    authors: [pubkey],
  };
  return getEventFromPoolAndCacheItIfNecessary({
    pubkey,
    filter,
    cachedEvent: await getCachedNostrRelayListEvent(pubkey),
    cache: cacheNostrRelayListEvent,
  });
};

export const publishEvent = async (relayUris: string[], event: Event) => {
  return Promise.any(pool.publish(relayUris, event));
};

export interface NostrUserProfile {
  name?: string;
  banner?: string;
  about?: string;
  website?: string;
  lud16?: string;
  nip05?: string;
  picture?: string;
  // non standard fields below
  [key: string]: string | undefined; // allows custom fields
  displayName?: string;
  bio?: string;
  lud06?: string;
  zapService?: string;
  publicHex?: string;
}

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

export const signEvent = async (eventTemplate: EventTemplate) => {
  const loggedInUserSeckey = await getSeckey();
  const anonSeckey = generateSecretKey();

  return finalizeEvent(
    eventTemplate,
    loggedInUserSeckey ? hexToBytes(loggedInUserSeckey) : anonSeckey,
  );
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

    return relaysToUse.filter((r) => !r.startsWith("wss://purplepag.es"));
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
  const signedEvent = await signEvent(eventTemplate);

  try {
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
  const nostrEventAddressPointer = `${wavlakeTrackKind}:${wavlakeZapPubkey}:${contentId}`;
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
    profile: wavlakeZapPubkey,
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
  zapRequest: EventTemplate;
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

export const getZapReceipt = async (invoice: string): Promise<Event | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const relay = await Relay.connect("wss://relay.wavlake.com");
      // seeing an API publish time that is 5 minutes behind the current time
      const offsetTime = 800;
      const since = Math.round(Date.now() / 1000) - offsetTime;
      const filter = {
        kinds: [9735],
        since,
      };
      const sub = relay.subscribe([filter], {
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

const followerTag = "p";

export const getEventById = (eventId: string) => {
  const filter = {
    ids: [eventId],
  };

  return pool.get(DEFAULT_READ_RELAY_URIS, filter);
};

const getKind3Event = (pubkey?: string) => {
  if (!pubkey) {
    return null;
  }

  const filter = {
    kinds: [Contacts],
    authors: [pubkey],
  };

  try {
    return pool.get(DEFAULT_READ_RELAY_URIS, filter);
  } catch {
    return null;
  }
};

export const useAddFollower = () => {
  const { refetchUser } = useUser();
  const { pubkey: loggedInPubkey } = useAuth();

  return useMutation({
    mutationFn: async ({ pubkey }: { pubkey: string }) => {
      let currentKind3Event: Event | EventTemplate | null =
        await getKind3Event(loggedInPubkey);

      if (!currentKind3Event) {
        // need to take care here, if we cant find the user's event, we need to create one, but we might not now which relays to use
        currentKind3Event = {
          kind: Contacts,
          created_at: Math.round(new Date().getTime() / 1000),
          content: "",
          tags: [],
        };
      }
      const existingFollowersPubkeys = currentKind3Event.tags
        .filter((follow) => follow[0] === followerTag)
        .map((follow) => follow[1]);
      const otherTags = currentKind3Event.tags.filter(
        (tag) => tag[0] !== followerTag,
      );
      const newFollowers = Array.from(
        new Set([...existingFollowersPubkeys, pubkey]),
      );

      const event = {
        kind: Contacts,
        created_at: Math.round(new Date().getTime() / 1000),
        content: currentKind3Event.content,
        tags: [
          ...newFollowers.map((follower) => [followerTag, follower]),
          ...otherTags,
        ],
      };

      const signed = await signEvent(event);
      // TODO use user's relay list event
      await publishEvent(DEFAULT_WRITE_RELAY_URIS, signed);
      await updatePubkeyMetadata(loggedInPubkey);
      refetchUser();
    },
  });
};

export const useRemoveFollower = () => {
  const { refetchUser } = useUser();
  const { pubkey: loggedInPubkey } = useAuth();

  return useMutation({
    mutationFn: async (removedFollowPubkey: string) => {
      const currentKind3Event = await getKind3Event(loggedInPubkey);
      if (!currentKind3Event) {
        return;
      }

      const event = {
        kind: Contacts,
        created_at: Math.round(new Date().getTime() / 1000),
        content: currentKind3Event?.content ?? "",
        tags: currentKind3Event.tags.filter(
          (follow) => follow[1] !== removedFollowPubkey,
        ),
      };
      const signed = await signEvent(event);
      // TODO use user's relay list event
      await publishEvent(DEFAULT_WRITE_RELAY_URIS, signed);
      await updatePubkeyMetadata(loggedInPubkey);
      refetchUser();
    },
  });
};

export const fetchReplies = async (kind1EventIds: string[]) => {
  const filter = {
    kinds: [1],
    ["#e"]: kind1EventIds,
  };

  return pool.querySync(DEFAULT_READ_RELAY_URIS, filter);
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
    authors: [wavlakeZapPubkey],
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
