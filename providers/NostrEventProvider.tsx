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
  limit: 51,
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
  getEventAsync: (id: string) => Promise<Event | null>;
  cacheEventById: (event: Event) => void;
  cacheEventsById: (events: Event[]) => void;
  getPubkeyProfile: (pubkey: string) => Promise<NostrUserProfile | null>;
  comments: string[];
  reactions: string[];
  reposts: string[];
  genericReposts: string[];
  zapReceipts: string[];
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
        const key = nostrQueryKeys.comments(pubkey);
        console.log("update key", queryClient.getQueryData(key));
        const socialEvents = await querySyncSince(socialFilter, readRelayList);

        setTimeout(() => {
          const kind1: string[] = [];
          const kind6: string[] = [];
          const kind7: string[] = [];
          const kind16: string[] = [];
          const kind9735: string[] = [];

          socialEvents.forEach((event) => {
            queryClient.setQueryData(nostrQueryKeys.event(event.id), event);

            switch (event.kind) {
              case 1:
                kind1.push(event.id);
                break;
              case 6:
                kind6.push(event.id);
                break;
              case 7:
                kind7.push(event.id);
                break;
              case 16:
                kind16.push(event.id);
                break;
              case 9735:
                kind9735.push(event.id);
                break;
            }
          });
          // Update queries in batches
          queryClient.setQueryData<string[]>(
            nostrQueryKeys.comments(pubkey),
            kind1,
          );
          queryClient.setQueryData<string[]>(
            nostrQueryKeys.reposts(pubkey),
            kind6,
          );
          queryClient.setQueryData<string[]>(
            nostrQueryKeys.reactions(pubkey),
            kind7,
          );
          queryClient.setQueryData<string[]>(
            nostrQueryKeys.genericReposts(pubkey),
            kind16,
          );
          queryClient.setQueryData<string[]>(
            nostrQueryKeys.zapReceipts(pubkey),
            kind9735,
          );
        }, 0);
      } catch (error) {
        console.error("Secondary load error:", error);
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
  const { data: comments = [] } = useQuery<string[]>({
    queryKey: nostrQueryKeys.comments(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: reactions = [] } = useQuery<string[]>({
    queryKey: nostrQueryKeys.reactions(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: reposts = [] } = useQuery<string[]>({
    queryKey: nostrQueryKeys.reposts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: genericReposts = [] } = useQuery<string[]>({
    queryKey: nostrQueryKeys.genericReposts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: zapReceipts = [] } = useQuery<string[]>({
    queryKey: nostrQueryKeys.zapReceipts(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  return (
    <NostrEventContext.Provider
      value={{
        getEventAsync,
        cacheEventById,
        cacheEventsById,
        getPubkeyProfile,
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
  contentReplies: (contentIds: string[]) => [
    "nostr",
    "related",
    "content-replies",
    contentIds,
  ],
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
