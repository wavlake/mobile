import { Event } from "nostr-tools";
import { useCacheNostrEvent } from "./useNostrEvent";

export const useCacheEvents = () => {
  const cacheEvent = useCacheNostrEvent();

  return (events: Event[]) => {
    events.forEach(cacheEvent);
  };
};
