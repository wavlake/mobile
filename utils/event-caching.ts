import { Event } from "nostr-tools";

// Types for cache structures
export type EventCache = Map<string, Event>;
export type KindEventCache = Record<number, EventCache>;

/**
 * Manages the merging of new events into the cache, maintaining uniqueness by event ID
 * @param events New events to merge into cache
 * @param oldCache Existing cache (optional)
 * @param filterKinds Optional array of kinds to filter events by
 * @returns Updated cache with merged events
 */
export function mergeEventsIntoCache(
  events: Event[],
  oldCache: KindEventCache = {},
  filterKinds?: number[],
): KindEventCache {
  try {
    // Initialize new cache
    const newCache: KindEventCache = {};

    // Create Maps for new events by kind
    const eventsByKind = events.reduce((acc, event) => {
      // Skip if we're filtering kinds and this kind isn't included
      if (filterKinds && !filterKinds.includes(event.kind)) {
        return acc;
      }

      if (!acc[event.kind]) {
        acc[event.kind] = new Map();
      }
      acc[event.kind].set(event.id, event);
      return acc;
    }, {} as KindEventCache);

    // Get all kinds that need processing
    const allKinds = new Set([
      ...Object.keys(oldCache).map(Number),
      ...Object.keys(eventsByKind).map(Number),
    ]);

    // Merge Maps for each kind
    for (const kind of allKinds) {
      // Ensure we're working with proper Maps
      const existingMap = ensureMap(oldCache[kind]);
      const newMap = ensureMap(eventsByKind[kind]);

      newCache[kind] = new Map([...existingMap, ...newMap]);
    }

    return newCache;
  } catch (e) {
    console.error("Error merging events into cache", e);
    // Ensure we return a valid cache even in error case
    return Object.entries(oldCache).reduce((acc, [kind, events]) => {
      acc[Number(kind)] = ensureMap(events);
      return acc;
    }, {} as KindEventCache);
  }
}

/**
 * Adds a single event to an existing cache
 * @param event Event to add
 * @param cache Existing cache
 * @returns Updated cache with new event
 */
export function addEventToCache(
  event: Event,
  cache: KindEventCache = {},
): KindEventCache {
  if (!cache[event.kind]) {
    cache[event.kind] = new Map();
  }

  cache[event.kind].set(event.id, event);
  return cache;
}

/**
 * Extracts an array of events for a specific kind from the cache
 * @param cache Event cache
 * @param kind Event kind to extract
 * @returns Array of events
 */
export function getEventsArrayFromCache(
  cache: KindEventCache,
  kind: number,
): Event[] {
  const map = ensureMap(cache[kind]);
  return Array.from(map?.values() ?? []);
}

/**
 * Gets events related to a specific event from the cache
 * @param cache Event cache
 * @returns Object containing arrays of different types of related events
 */
export function getRelatedEventsFromCache(cache: KindEventCache) {
  return {
    replies: getEventsArrayFromCache(cache, 1).sort(
      (a, b) => a.created_at - b.created_at,
    ),
    reactions: getEventsArrayFromCache(cache, 7),
    reposts: getEventsArrayFromCache(cache, 6),
    genericReposts: getEventsArrayFromCache(cache, 16),
    zapReceipts: getEventsArrayFromCache(cache, 9735),
  };
}

function ensureMap(value: any): Map<string, Event> {
  if (value instanceof Map) {
    return value;
  }
  // If it's an array, convert it to a Map
  if (Array.isArray(value)) {
    return new Map(value.map((event) => [event.id, event]));
  }
  // If it's an object with values that should be in a Map
  if (value && typeof value === "object" && !Array.isArray(value)) {
    try {
      return new Map(Object.entries(value));
    } catch (e) {
      console.warn("Failed to convert object to Map:", e);
    }
  }
  // Default to empty Map if conversion fails
  return new Map();
}

export const getEventArray = (data: EventCache | object = new Map()) => {
  if (data instanceof Map) {
    return Array.from(data.values());
  }
  // Handle plain object case
  return Object.values(data || {});
};
