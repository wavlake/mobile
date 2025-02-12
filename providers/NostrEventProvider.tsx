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
  getFollowsListMap,
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
      const socialQueryKey = ["nostr", "social", pubkey];
      const since = getQueryTimestamp(queryClient, socialQueryKey);
      const socialFilter = {
        ...SOCIAL_NOTES,
        "#p": [pubkey],
        since,
      };

      const socialEvents = await querySync(socialFilter, readRelayList);
      if (socialEvents.length > 0) {
        updateQueryTimestamp(queryClient, socialQueryKey, socialEvents);
      }

      // cache events individually
      cacheEventsById(socialEvents);

      // sort events
      const eventsByKind = socialEvents.reduce(
        (acc, event) => {
          if (!acc[event.kind]) {
            acc[event.kind] = [];
          }
          acc[event.kind].push(event);
          return acc;
        },
        {} as Record<string, Event[]>,
      );

      // update cache
      Object.entries(eventsByKind).forEach(([kind, events]) => {
        const queryKey = getQueryKeyForKind(Number(kind), pubkey);
        if (!queryKey) return;
        queryClient.setQueryData(queryKey, events);
        // we can use the most recent created_at from the initial socialEvents list
        updateQueryTimestamp(queryClient, queryKey, socialEvents);
      });

      // fetch event-related events
      const eventSocialFilter = {
        ...SOCIAL_NOTES,
        "#e": socialEvents.map((event) => event.id),
        since,
      };

      const eventSocialEvents = await querySync(
        eventSocialFilter,
        readRelayList,
      );

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
        const eTagQueryKey = nostrQueryKeys.eTagEvents(eventId);
        queryClient.setQueryData<Event[]>(eTagQueryKey, (oldCache = []) =>
          mergeEventsIntoCache(events, oldCache),
        );
        // we can use the most recent created_at from the initial socialEvents list
        updateQueryTimestamp(queryClient, eTagQueryKey, socialEvents);
      }
    } catch (error) {
      console.error("Secondary data load error:", error);
    }
  };

  const { data: comments = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.pTagComments(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: reactions = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.pTagReactions(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: reposts = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.pTagReposts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: genericReposts = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.pTagGenericReposts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: zapReceipts = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.pTagZapReceipts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: initialData } = useQuery<{
    follows: string[];
    followsMap: Record<string, string>;
  }>({
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
        comments,
        reactions,
        reposts,
        genericReposts,
        zapReceipts,
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

export function mergeEventsIntoCache(events: Event[], oldCache: Event[] = []) {
  const newCache = new Map(oldCache.map((event) => [event.id, event]));
  for (const event of events) {
    newCache.set(event.id, event);
  }
  return Array.from(newCache.values());
}
