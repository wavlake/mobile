import { createContext, useContext, useCallback, ReactNode } from "react";
import { Event, Filter } from "nostr-tools";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEventById, getProfileMetadata, NostrUserProfile } from "@/utils";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { getFollowsListMap } from "@/utils";
import { pool } from "@/utils/relay-pool";
import { useAuth } from "@/hooks";

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
  getEvent: (id: string) => Promise<Event | null>;
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

  const getEvent = useCallback(
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

  // app load event queries
  const { data } = useQuery({
    queryKey: ["initial-load", pubkey],
    queryFn: async () => {
      if (!pubkey) return defaultNostrEventContext;

      try {
        const followsMap = await getFollowsListMap(pubkey, readRelayList);
        const follows = followsMap ? Object.keys(followsMap) : [];

        const socialFilter = {
          ...SOCIAL_NOTES,
          "#p": [pubkey],
        };
        const socialEvents = await pool.querySync(readRelayList, socialFilter);
        // const followsActivity = await pool.querySync(readRelayList, {
        //   ...FOLLOWS_SOCIAL_NOTES,
        //   authors: follows,
        // });
        // followsActivity.forEach(cacheEventById);
        // const followsQueryKey = nostrQueryKeys.follows(pubkey);
        // queryClient.setQueryData(
        //   followsQueryKey,
        //   followsActivity.map((e) => e.id),
        // );

        // setTimestamp(comments_FILTER);
        const kind1: string[] = [];
        const kind6: string[] = [];
        const kind7: string[] = [];
        const kind16: string[] = [];
        const kind9735: string[] = [];
        // sort social eventIds into different kinds
        socialEvents.forEach((event) => {
          cacheEventById(event);
          if (event.kind === 1) {
            kind1.push(event.id);
          } else if (event.kind === 6) {
            kind6.push(event.id);
          } else if (event.kind === 7) {
            kind7.push(event.id);
          } else if (event.kind === 16) {
            kind16.push(event.id);
          } else if (event.kind === 9735) {
            kind9735.push(event.id);
          }
        });
        // cache events
        queryClient.setQueryData(nostrQueryKeys.comments(pubkey), kind1);
        queryClient.setQueryData(nostrQueryKeys.reposts(pubkey), kind6);
        queryClient.setQueryData(nostrQueryKeys.reactions(pubkey), kind7);
        queryClient.setQueryData(nostrQueryKeys.genericReposts(pubkey), kind16);
        queryClient.setQueryData(nostrQueryKeys.zapReceipts(pubkey), kind9735);

        pool.subscribeMany(
          readRelayList,
          [
            {
              ...PUBKEY_METADATA,
              authors: [pubkey, ...(follows.length ? follows : [])],
            },
          ],
          {
            onevent: (event) => {
              const queryKey = nostrQueryKeys.profile(event.pubkey);
              const existingData = queryClient.getQueryData<Event>(queryKey);

              // Only update if new event is more recent
              if (!existingData || event.created_at > existingData.created_at) {
                queryClient.setQueryData(queryKey, event, {
                  updatedAt: Date.now(),
                });
              }
            },
          },
        );

        return {
          comments: kind1,
          reactions: kind7,
          reposts: kind6,
          genericReposts: kind16,
          zapReceipts: kind9735,
          follows,
          followsActivity: [],
          followsMap,
        };
      } catch (error) {
        console.error("Initial load error:", error);
        return defaultNostrEventContext;
      }
    },
    enabled: Boolean(pubkey),
    retry: false,
  });

  const getPubkeyProfile = useCallback(
    async (pubkey: string) => {
      const queryKey = nostrQueryKeys.profile(pubkey);

      const event = await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          return getProfileMetadata(pubkey);
        },
        staleTime: FORTY_EIGHT_HOURS,
        gcTime: FORTY_EIGHT_HOURS * 10,
      });

      return event ? decodeProfileMetadata(event) : null;
    },
    [queryClient],
  );

  return (
    <NostrEventContext.Provider
      value={{
        getEvent,
        cacheEventById,
        cacheEventsById,
        getPubkeyProfile,
        comments: data?.comments ?? [],
        reactions: data?.reactions ?? [],
        reposts: data?.reposts ?? [],
        genericReposts: data?.genericReposts ?? [],
        zapReceipts: data?.zapReceipts ?? [],
        follows: data?.follows ?? [],
        followsActivity: [],
        followsMap: data?.followsMap ?? {},
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
