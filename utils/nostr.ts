// this is needed to polyfill TextDecoder which nostr-tools uses
import "fast-text-encoding";

// this is needed to polyfill crypto.getRandomValues which nostr-tools uses
import "react-native-get-random-values";

import {
  nip19,
  relayInit,
  Filter,
  Event,
  finishEvent,
  EventTemplate,
  nip57,
  generatePrivateKey,
} from "nostr-tools";
import axios from "axios";
import {
  cacheNostrProfileEvent,
  cacheNostrRelayListEvent,
  getCachedNostrProfileEvent,
  getCachedNostrRelayListEvent,
} from "@/utils/cache";
import { getSeckey } from "@/utils/secureStorage";

export { getPublicKey, generatePrivateKey } from "nostr-tools";

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

export const encodeNpub = (pubkey: string) => {
  try {
    return nip19.npubEncode(pubkey);
  } catch {
    return null;
  }
};

export const encodeNsec = (seckey: string) => {
  try {
    return nip19.nsecEncode(seckey);
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

const getEventFromRelay = (
  relayUri: string,
  filter: Filter,
): Promise<Event | null> => {
  return new Promise((resolve, reject) => {
    const relay = relayInit(relayUri);

    relay.on("connect", async () => {
      const event = await relay.get(filter);

      relay.close();
      resolve(event);
    });
    relay.on("error", () => {
      relay.close();
      reject(new Error(`failed to connect to ${relay.url}`));
    });

    relay.connect();
  });
};

/**
 * This function is more complicated than it needs to be because SimplePool would not work for some reason.
 * TODO: make an endpoint to fetch nostr profile metadata and remove this function.
 */
const getEventFromPool = async (
  filter: Filter,
  relayUris: string[] = DEFAULT_READ_RELAY_URIS,
) => {
  const promises = relayUris.map((relayUri) =>
    getEventFromRelay(relayUri, filter),
  );
  const events = (await Promise.allSettled(promises))
    .map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
    })
    .filter((result) => {
      return result !== undefined && result !== null;
    }) as Event[];

  if (events.length === 0) {
    return null;
  }

  return getMostRecentEvent(events);
};

const getEventFromPoolAndCacheItIfNecessary = async ({
  pubkey,
  filter,
  cachedEvent,
  cache,
  relayUris,
}: {
  pubkey: string;
  filter: Filter;
  cachedEvent: Event | null;
  cache: Function;
  relayUris?: string[];
}) => {
  try {
    const event = await getEventFromPool(filter, relayUris);

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

const publishEventToRelay = (relayUri: string, event: Event): Promise<void> => {
  return new Promise((resolve, reject) => {
    const relay = relayInit(relayUri);

    relay.on("connect", async () => {
      await relay.publish(event);
      relay.close();
      resolve();
    });
    relay.on("error", () => {
      relay.close();
      reject(new Error(`failed to connect to ${relay.url}`));
    });

    relay.connect();
  });
};

export const publishEvent = async (relayUris: string[], event: Event) => {
  return Promise.any(
    relayUris.map((relayUri) => publishEventToRelay(relayUri, event)),
  );
};

export interface NostrUserProfile {
  [key: string]: string | undefined; // allows custom fields
  name?: string;
  displayName?: string;
  image?: string;
  banner?: string;
  bio?: string;
  nip05?: string;
  lud06?: string;
  lud16?: string;
  about?: string;
  zapService?: string;
  website?: string;
}

export const makeProfileEvent = (pubkey: string, profile: NostrUserProfile) => {
  return {
    kind: 0,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content: JSON.stringify(profile),
  };
};

export const signEvent = async (eventTemplate: EventTemplate) => {
  const loggedInUserSeckey = await getSeckey();
  const anonSeckey = generatePrivateKey();

  return finishEvent(eventTemplate, loggedInUserSeckey ?? anonSeckey);
};

export const makeRelayListEvent = (pubkey: string, relayUris: string[]) => {
  return {
    kind: 10002,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: relayUris.map((relay) => ["r", relay]),
    content: "",
  };
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

export const fetchInvoice = async ({
  relayUris,
  amountInSats,
  comment,
  addressPointer,
  zappedPubkey,
}: {
  relayUris: string[];
  amountInSats: number;
  comment: string;
  addressPointer: string;
  zappedPubkey: string;
}) => {
  const wavlakeRelayUri = "wss://relay.wavlake.com/";
  const amountInMillisats = amountInSats * 1000;
  const zapEndpoint = "https://www.wavlake.com/api/zap";
  const zapRequestEvent = await nip57.makeZapRequest({
    profile: zappedPubkey,
    amount: amountInMillisats,
    relays: [...relayUris, wavlakeRelayUri],
    comment,
    event: null,
  });

  zapRequestEvent.tags.push(["a", addressPointer, wavlakeRelayUri]);

  const signedZapRequestEvent = await signEvent(zapRequestEvent);
  const url = `${zapEndpoint}?amount=${amountInMillisats}&nostr=${encodeURIComponent(
    JSON.stringify(signedZapRequestEvent),
  )}`;

  try {
    const { data } = await axios(url);

    return data.pr;
  } catch (error) {
    console.log(error);
  }
};

export const getZapReceipt = async (invoice: string) => {
  const relay = relayInit("wss://relay.wavlake.com/");
  const since = Math.round(Date.now() / 1000);

  relay.on("error", () => {
    throw new Error(`failed to connect to ${relay.url}`);
  });

  await relay.connect();

  return new Promise((resolve) => {
    const sub = relay.sub([
      {
        kinds: [9735],
        since,
      },
    ]);

    sub.on("event", (event) => {
      if (event.tags.find((t) => t[0] === "bolt11" && t[1] === invoice)) {
        resolve(event);
      }
    });
  });
};
