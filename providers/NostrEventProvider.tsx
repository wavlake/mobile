import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useState,
} from "react";
import { Event, Filter } from "nostr-tools";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEventById,
  KindEventCache,
  mergeEventsIntoCache,
  getFollowsListMap,
  EventCache,
  getEventArray,
  getQueryTimestamp,
  updateQueryTimestamp,
} from "@/utils";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { pool } from "@/utils/relay-pool";
import { useAuth } from "@/hooks";
import {
  getQueryKeyForKind,
  NostrEventContextType,
  nostrQueryKeys,
  SOCIAL_NOTES,
} from "./constants";

const NostrEventContext = createContext<NostrEventContextType | null>(null);

export function NostrEventProvider({ children }: { children: ReactNode }) {
  const { pubkey } = useAuth();
  const queryClient = useQueryClient();
  const { readRelayList } = useNostrRelayList();
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);

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
      const events = await querySyncSince(filter, readRelayList);
      return events;
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

      return querySyncSince(filter, readRelayList);
    },
    [queryClient, readRelayList],
  );

  const loadInitialData = useCallback(async () => {
    if (!pubkey) return;
    setIsLoadingInitial(true);

    try {
      // Load critical data
      const followsMap = await getFollowsListMap(pubkey, readRelayList);
      const follows = followsMap ? Object.keys(followsMap) : [];

      // Update context with initial data
      queryClient.setQueryData(["initial-load-core", pubkey], {
        follows,
        followsMap,
        comments: [],
        reactions: [],
        reposts: [],
        genericReposts: [],
        zapReceipts: [],
        followsActivity: [],
      });

      // Load secondary data
      await loadSecondaryData();
    } catch (error) {
      console.error("Initial data load error:", error);
    } finally {
      setIsLoadingInitial(false);
    }
  }, [pubkey, readRelayList, queryClient]);

  const loadSecondaryData = async () => {
    try {
      const socialFilter = {
        ...SOCIAL_NOTES,
        "#p": [pubkey],
      };
      const socialEvents = await querySyncSince(socialFilter, readRelayList);

      setTimeout(() => {
        // Cache individual events and update kind-specific caches
        socialEvents.forEach((event) => {
          queryClient.setQueryData(nostrQueryKeys.event(event.id), event);
        });

        const kindCache = mergeEventsIntoCache(socialEvents);

        // Update queries with Map caches
        for (const [kind, cache] of Object.entries(kindCache)) {
          const queryKey = getQueryKeyForKind(Number(kind), pubkey);
          if (!queryKey) continue;
          queryClient.setQueryData(queryKey, cache);
        }
      }, 0);

      // Handle event-related events
      const eventSocialFilter = {
        ...SOCIAL_NOTES,
        "#e": socialEvents.map((event) => event.id),
      };

      const eventSocialEvents = await querySyncSince(
        eventSocialFilter,
        readRelayList,
      );

      setTimeout(() => {
        const eventIdMap = new Map<string, Event[]>();

        // Group events by their referenced event ID
        for (const event of eventSocialEvents) {
          const eTag = event.tags.find(([tag]) => tag === "e");
          const eventId = eTag?.[1];
          if (!eventId) continue;

          if (!eventIdMap.has(eventId)) {
            eventIdMap.set(eventId, []);
          }
          eventIdMap.get(eventId)!.push(event);
        }

        // Update cache for each referenced event
        for (const [eventId, events] of eventIdMap) {
          queryClient.setQueryData<KindEventCache>(
            nostrQueryKeys.eTagEvents(eventId),
            (oldCache = {}) => mergeEventsIntoCache(events, oldCache),
          );
        }
      }, 0);
    } catch (error) {
      console.error("Secondary data load error:", error);
    }
  };

  const querySyncSince = useCallback(
    async (filter: Filter, readRelayList: string[]) => {
      const queryKey = ["nostr", "filter", JSON.stringify(filter)];
      const lastQueryTime = getQueryTimestamp(queryClient, queryKey);

      const updatedFilter = {
        ...filter,
        since: lastQueryTime,
      };

      const events = await pool.querySync(readRelayList, updatedFilter);
      if (!events?.length) return [];

      updateQueryTimestamp(queryClient, queryKey, events);
      return events;
    },
    [queryClient],
  );

  const { data: comments } = useQuery<EventCache>({
    queryKey: nostrQueryKeys.pTagComments(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: reactions } = useQuery<EventCache>({
    queryKey: nostrQueryKeys.pTagReactions(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: reposts } = useQuery<EventCache>({
    queryKey: nostrQueryKeys.pTagReposts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: genericReposts } = useQuery<EventCache>({
    queryKey: nostrQueryKeys.pTagGenericReposts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: zapReceipts } = useQuery<EventCache>({
    queryKey: nostrQueryKeys.pTagZapReceipts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: initialData } = useQuery<
    Partial<NostrEventContextType> & { follows: string[] }
  >({
    queryKey: ["initial-load-core", pubkey],
    enabled: Boolean(pubkey),
  });

  return (
    <NostrEventContext.Provider
      value={{
        getLatestEvent,
        querySync,
        getEventFromId,
        cacheEventById,
        cacheEventsById,
        getEventRelatedEvents,
        comments: getEventArray(comments),
        reactions: getEventArray(reactions),
        reposts: getEventArray(reposts),
        genericReposts: getEventArray(genericReposts),
        zapReceipts: getEventArray(zapReceipts),
        follows: initialData?.follows ?? [],
        followsActivity: [],
        followsMap: initialData?.followsMap ?? {},
        loadInitialData,
        isLoadingInitial,
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
