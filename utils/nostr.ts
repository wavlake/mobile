// this is needed to polyfill TextDecoder which nostr-tools uses
import "fast-text-encoding";

import { nip19, relayInit, Filter, Event } from "nostr-tools";
import { cacheNostrProfile } from "@/utils/cache";

export { getPublicKey } from "nostr-tools";

export const decodeNsec = (nsec: string) => {
  try {
    const { type, data } = nip19.decode(nsec);

    return type === "nsec" ? data : null;
  } catch {
    return null;
  }
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
  relayUris: string[] = [
    "wss://purplepag.es",
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
    "wss://nostr.wine",
    "wss://relay.snort.social",
    "wss://relay.wavlake.com",
  ],
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

  return events.sort((a, b) => b.created_at - a.created_at)[0];
};

export const getProfileMetadata = async (pubkey: string) => {
  try {
    const mostRecentProfileEvent = await getEventFromPool({
      kinds: [0],
      authors: [pubkey],
    });

    if (mostRecentProfileEvent === null) {
      return null;
    }

    cacheNostrProfile(pubkey, mostRecentProfileEvent.content);

    return JSON.parse(mostRecentProfileEvent.content);
  } catch {
    return null;
  }
};
