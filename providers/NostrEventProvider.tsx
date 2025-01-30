import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { Event, Filter } from "nostr-tools";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEventById,
  getLastFetchTime,
  NostrUserProfile,
  setLastFetchTime,
} from "@/utils";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { getFollowsListMap } from "@/utils";
import { pool } from "@/utils/relay-pool";
import { useAuth } from "@/hooks";
import { InteractionManager } from "react-native";

const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
const SOCIAL_NOTES: Filter = {
  kinds: [
    // comment
    1,
    // repost
    6,
    // generic repost
    16,
    // reaction
    7,
    // zap receipt
    9735,
  ],
  limit: 100,
};

const FOLLOWS_SOCIAL_NOTES: Filter = {
  kinds: [
    // comment
    1,
    // repost
    6,
    // generic repost
    16,
  ],
  limit: 52,
};

const RECENT_COMMENT_ACTIVITY: Filter = {
  kinds: [
    // repost
    6,
    // generic repost
    16,
    // reaction
    7,
    // zap receipt
    9735,
  ],
  limit: 53,
};

const PUBKEY_METADATA: Filter = {
  kinds: [0],
};

const FOLLOWS_FILTER: Filter = {
  kinds: [
    // Follows
    3,
    // mute list
    10000,
    // user emoji list
    10030,
  ],
};

type NostrEventContextType = {
  querySync: (filter: Filter) => Promise<Event[]>;
  getEventAsync: (id: string) => Promise<Event | null>;
  cacheEventById: (event: Event) => void;
  cacheEventsById: (events: Event[]) => void;
  getPubkeyProfile: (pubkey: string) => Promise<NostrUserProfile | null>;
  getEventRelatedEvents: (event: Event) => Promise<Event[]>;
  comments: Event[];
  reactions: Event[];
  reposts: Event[];
  genericReposts: Event[];
  zapReceipts: Event[];
  follows: string[];
  followsActivity: string[];
  // Record<followPubkey, followRelay>
  followsMap: Record<string, string>;
};

const defaultNostrEventContext: Partial<NostrEventContextType> = {
  comments: [],
  reactions: [],
  reposts: [],
  genericReposts: [],
  zapReceipts: [],
  follows: [],
  followsActivity: [],
  followsMap: {},
};

const NostrEventContext = createContext<NostrEventContextType | null>(null);

export function NostrEventProvider({ children }: { children: ReactNode }) {
  const { pubkey } = useAuth();
  const queryClient = useQueryClient();
  const { readRelayList } = useNostrRelayList();

  const getEventAsync = useCallback(
    async (id: string) => {
      const queryKey = nostrQueryKeys.event(id);

      // Check cache first
      const cachedEvent = queryClient.getQueryData<Event>(queryKey);
      if (cachedEvent) {
        // console.log("fetched cached event", cachedEvent.id);
        return cachedEvent;
      }

      // Fetch if not in cache
      try {
        const event = await getEventById(id);
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
    async (filter: Filter) => {
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
    async (event: Event) => {
      const filter = {
        kinds: [0, 1, 6, 7, 16, 9735],
        ["#e"]: [event.id],
      };
      const events = await querySyncSince(filter, readRelayList);

      return events;
    },
    [queryClient, readRelayList],
  );

  // Core functionality that should load immediately
  const { data: initialData } = useQuery({
    queryKey: ["initial-load-core", pubkey],
    queryFn: async () => {
      if (!pubkey) return defaultNostrEventContext;
      // Wait for animations to complete
      await InteractionManager.runAfterInteractions();
      try {
        // Only load critical data first
        const followsMap = await getFollowsListMap(pubkey, readRelayList);
        const follows = followsMap ? Object.keys(followsMap) : [];
        return {
          follows,
          followsMap,
          comments: [],
          reactions: [],
          reposts: [],
          genericReposts: [],
          zapReceipts: [],
          followsActivity: [],
        };
      } catch (error) {
        console.error("Initial core load error:", error);
        return defaultNostrEventContext;
      }
    },
    enabled: Boolean(pubkey),
    retry: false,
  });

  // Secondary data loading
  useEffect(() => {
    if (!pubkey || !initialData) return;

    const loadSecondaryData = async () => {
      // Wait for animations to complete
      await InteractionManager.runAfterInteractions();

      try {
        const socialFilter = {
          ...SOCIAL_NOTES,
          "#p": [pubkey],
        };
        const socialEvents = await querySyncSince(socialFilter, readRelayList);

        setTimeout(() => {
          // Use Maps to store events by kind
          const eventsByKind = new Map<number, Map<string, Event>>();

          socialEvents.forEach((event) => {
            // Cache individual events
            queryClient.setQueryData(nostrQueryKeys.event(event.id), event);

            // Initialize Map for this kind if it doesn't exist
            if (!eventsByKind.has(event.kind)) {
              eventsByKind.set(event.kind, new Map());
            }

            // Add event to appropriate kind Map using id as key
            eventsByKind.get(event.kind)!.set(event.id, event);
          });
          // Update queries with deduplicated events
          queryClient.setQueryData<Event[]>(
            nostrQueryKeys.comments(pubkey),
            Array.from(eventsByKind.get(1)?.values() ?? []),
          );
          queryClient.setQueryData<Event[]>(
            nostrQueryKeys.reposts(pubkey),
            Array.from(eventsByKind.get(6)?.values() ?? []),
          );
          queryClient.setQueryData<Event[]>(
            nostrQueryKeys.reactions(pubkey),
            Array.from(eventsByKind.get(7)?.values() ?? []),
          );
          queryClient.setQueryData<Event[]>(
            nostrQueryKeys.genericReposts(pubkey),
            Array.from(eventsByKind.get(16)?.values() ?? []),
          );
          queryClient.setQueryData<Event[]>(
            nostrQueryKeys.zapReceipts(pubkey),
            Array.from(eventsByKind.get(9735)?.values() ?? []),
          );
        }, 0);

        // load event comments, reactions, reposts, generic reposts, and zaps
        const eventSocialFilter = {
          ...SOCIAL_NOTES,
          "#e": socialEvents.map((event) => event.id),
        };

        const eventSocialEvents = await querySyncSince(
          eventSocialFilter,
          readRelayList,
        );

        setTimeout(() => {
          const eventIdMap = new Map<string, Map<number, Map<string, Event>>>();

          for (const event of eventSocialEvents) {
            const eTag = event.tags.find(([tag]) => tag === "e");
            const eventId = eTag?.[1];

            if (!eventId) continue;

            // Initialize maps if they don't exist
            if (!eventIdMap.has(eventId)) {
              eventIdMap.set(eventId, new Map());
            }

            const kindMap = eventIdMap.get(eventId)!;
            if (!kindMap.has(event.kind)) {
              kindMap.set(event.kind, new Map());
            }

            // Store event using its id as key
            kindMap.get(event.kind)!.set(event.id, event);
          }

          // Update cache for each referenced event
          for (const [eventId, kindMap] of eventIdMap) {
            queryClient.setQueryData<Record<number, Event[]>>(
              nostrQueryKeys.eventRelatedEvents(eventId),
              (oldData: Record<number, Event[]> = {}) => {
                const newData: Record<number, Event[]> = { ...oldData };

                for (const [kind, eventsMap] of kindMap.entries()) {
                  // Convert existing events array to Map for deduplication
                  const existingEvents = new Map(
                    (oldData[kind] ?? []).map((event) => [event.id, event]),
                  );

                  // Merge existing and new events
                  const mergedEvents = new Map([
                    ...existingEvents,
                    ...eventsMap,
                  ]);

                  // Convert back to array
                  newData[kind] = Array.from(mergedEvents.values());
                }

                return newData;
              },
            );
          }
        }, 0);
      } catch (error) {
        console.error("Secondary data load error:", error);
      }
    };

    loadSecondaryData();
  }, [pubkey, initialData, queryClient]);

  const getPubkeyProfile = useCallback(
    async (pubkey: string, relayList: string[] = readRelayList) => {
      const queryKey = nostrQueryKeys.profile(pubkey);
      const filter = {
        kinds: [0],
        authors: [pubkey],
      };
      const event = await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          return getEventSince(filter, relayList);
        },
        staleTime: FORTY_EIGHT_HOURS,
        gcTime: FORTY_EIGHT_HOURS * 10,
      });

      return event ? decodeProfileMetadata(event) : null;
    },
    [queryClient],
  );
  const { data: comments = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.comments(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: reactions = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.reactions(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: reposts = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.reposts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: genericReposts = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.genericReposts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: zapReceipts = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.zapReceipts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  return (
    <NostrEventContext.Provider
      value={{
        querySync,
        getEventAsync,
        cacheEventById,
        cacheEventsById,
        getPubkeyProfile,
        getEventRelatedEvents,
        comments,
        reactions,
        reposts,
        genericReposts,
        zapReceipts,
        follows: initialData?.follows ?? [],
        followsActivity: [],
        followsMap: initialData?.followsMap ?? {},
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

export const nostrQueryKeys = {
  event: (id: string) => ["nostr", "event", id],
  profile: (pubkey: string) => ["nostr", "profile", "event", pubkey],
  relayList: (pubkey: string) => ["nostr", "relayList", "event", pubkey],
  // TODO - clean up old follows hooks (add, remove, get)
  follows: (pubkey: string | null | undefined) => [
    "nostr",
    "follows",
    "event",
    pubkey,
  ],
  // kind 1 with user pubkey #p tag
  comments: (pubkey: string) => ["nostr", "kind1", pubkey],
  // kind 6 with user pubkey #p tag
  reposts: (pubkey: string) => ["nostr", "kind6", pubkey],
  // kind 7 with user pubkey #p tag
  reactions: (pubkey: string) => ["nostr", "kind7", pubkey],
  // kind 16 with user pubkey #p tag
  genericReposts: (pubkey: string) => ["nostr", "kind16", pubkey],
  // kind 9735 with user pubkey #p tag
  zapReceipts: (pubkey: string) => ["nostr", "kind9735", pubkey],
  // any kind with event #e tag that references the eventId (replies, reposts, reactions, etc)
  eventRelatedEvents: (eventId: string) => [
    "nostr",
    "eventRelatedEvents",
    eventId,
  ],
  contentComments: (contentId: string) => [
    "nostr",
    "content-comments",
    contentId,
  ],
  // kind 1 with event #e tag
  replies: (eventId: string) => ["nostr", "replies", eventId],
};

const decodeProfileMetadata = (event: Event) => {
  try {
    return JSON.parse(event.content) as NostrUserProfile;
  } catch {
    return null;
  }
};

const querySyncSince = async (filter: Filter, readRelayList: string[]) => {
  const queryKey = JSON.stringify(filter);
  const lastFetch = await getLastFetchTime(queryKey);

  // Only fetch events newer than our last fetch
  const updatedFilter = {
    ...filter,
    since: lastFetch,
  };

  const events = await pool.querySync(readRelayList, updatedFilter);
  if (!events) return [];

  // Update the last fetch time after successful query
  await setLastFetchTime(queryKey);

  return events;
};

// use pool.get
const getEventSince = async (filter: Filter, readRelayList: string[]) => {
  const queryKey = JSON.stringify(filter);
  const lastFetch = await getLastFetchTime(queryKey);
  const updatedFilter = {
    ...filter,
    since: lastFetch,
  };
  const event = await pool.get(readRelayList, updatedFilter);
  if (!event) return null;

  await setLastFetchTime(queryKey);
  return event;
};
