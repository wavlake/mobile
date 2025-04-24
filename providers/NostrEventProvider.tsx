import { createContext, useContext, useCallback, ReactNode } from "react";
import { Event, Filter } from "nostr-tools";
import { useQueryClient } from "@tanstack/react-query";
import { getEventById } from "@/utils";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { pool } from "@/utils/relay-pool";
import { NostrEventContextType, nostrQueryKeys } from "./constants";

const NostrEventContext = createContext<NostrEventContextType | null>(null);

export function NostrEventProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { readRelayList, writeRelayList } = useNostrRelayList();

  const getLatestEvent = useCallback(
    async (filter: Filter, relays: string[] = readRelayList) => {
      const event = await pool.get(relays, filter);
      if (!event) return null;

      const queryKey = nostrQueryKeys.event(event.id);
      queryClient.setQueryData(queryKey, event);

      return event;
    },
    [pool, queryClient],
  );

  const getEventFromId = useCallback(
    async (id: string, relays?: string[]) => {
      const queryKey = nostrQueryKeys.event(id);

      // Check cache first
      const cachedEvent = queryClient.getQueryData<Event>(queryKey);
      if (cachedEvent) {
        return cachedEvent;
      }

      // Fetch if not in cache
      try {
        const event = await getEventById(id, relays);
        if (event) {
          queryClient.setQueryData(queryKey, event);
        }
        return event;
      } catch (error) {
        console.error("Error fetching event:", error);
        return null;
      }
    },
    [queryClient],
  );

  const querySync = useCallback(
    async (filter: Filter, relays: string[] = readRelayList) => {
      console.log("querySync", filter, relays);
      return pool.querySync(relays, filter);
    },
    [readRelayList],
  );

  const cacheEventById = useCallback(
    (event: Event) => {
      const queryKey = nostrQueryKeys.event(event.id);
      queryClient.setQueryData(queryKey, event);
    },
    [queryClient],
  );

  const cacheEventsById = useCallback(
    (events: Event[]) => {
      events.forEach(cacheEventById);
    },
    [queryClient],
  );

  const getEventRelatedEvents = useCallback(
    async (event: Event, since?: number) => {
      const filter = {
        kinds: [0, 1, 6, 7, 16, 9735],
        ["#e"]: [event.id],
        since,
      };

      return querySync(filter, readRelayList);
    },
    [queryClient, readRelayList],
  );

  const publishEvent = useCallback(
    async (event: Event) => {
      const queryKey = nostrQueryKeys.event(event.id);
      queryClient.setQueryData(queryKey, event);
      await pool.publish(writeRelayList, event);
    },
    [queryClient],
  );

  return (
    <NostrEventContext.Provider
      value={{
        getLatestEvent,
        querySync,
        getEventFromId,
        cacheEventById,
        cacheEventsById,
        getEventRelatedEvents,
        publishEvent,
      }}
    >
      {children}
    </NostrEventContext.Provider>
  );
}

export function useNostrEvents() {
  const context = useContext(NostrEventContext);
  if (!context) {
    throw new Error("useNostrEvents must be used within a NostrEventProvider");
  }
  return context;
}

export function mergeEventsIntoCache(events: Event[], oldCache: Event[] = []) {
  const newCache = new Map(oldCache.map((event) => [event.id, event]));
  for (const event of events) {
    newCache.set(event.id, event);
  }
  const orderedByCreatedAt = Array.from(newCache.values()).sort(
    (a, b) => b.created_at - a.created_at,
  );
  return orderedByCreatedAt;
}
