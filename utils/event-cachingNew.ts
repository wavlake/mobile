import { Event } from "nostr-tools";

export interface NostrCacheEntry {
  events: Event[];
  lastQueried: number;
}

export interface NostrQueryContext {
  lastQueried?: number;
}

export function mergeNostrEvents(
  oldEvents: Event[] = [],
  newEvents: Event[] = [],
): Event[] {
  const eventMap = new Map(oldEvents.map((event) => [event.id, event]));

  newEvents.forEach((event) => {
    eventMap.set(event.id, event);
  });

  return Array.from(eventMap.values()).sort(
    (a, b) => b.created_at - a.created_at,
  );
}

export function getLastQueried(events: Event[]): number {
  if (!Array.isArray(events) || events.length === 0) return 0;
  return Math.max(...events.map((event) => event.created_at));
}
