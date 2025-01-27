import { createContext, useContext, useCallback, ReactNode } from "react";
import { Event, Filter } from "nostr-tools";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEventById } from "@/utils";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrFilterTimestamps } from "@/hooks/useNostrFilterTimestamps";
import { useNostrProfileQueryKey } from "@/hooks/nostrProfile/useNostrProfileQueryKey";
import { decodeProfileMetadata } from "@/hooks/nostrProfile";
import { getFeedEventsQueryKey } from "@/hooks/useNostrFeedEvents";
import { getFeedInteractionsQueryKey } from "@/hooks/useNostrFeedInteractions";
import { getFollowsListMap } from "@/utils";
import { pool } from "@/utils/relay-pool";
import { useAuth } from "@/hooks";

const MENTIONS_FILTER: Filter = {
  kinds: [1],
  limit: 51,
};

const METADATA_FILTER: Filter = {
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
  cacheEvent: (event: Event) => void;
  cacheEvents: (events: Event[]) => void;
  mentionEvents: Event[];
  follows: string[];
  // Record<followPubkey, followRelay>
  followsMap: Record<string, string>;
};

const NostrEventContext = createContext<NostrEventContextType | null>(null);

export function NostrEventProvider({ children }: { children: ReactNode }) {
  const { pubkey } = useAuth();
  const queryClient = useQueryClient();
  const { readRelayList } = useNostrRelayList();
  const { getTimestamp, setTimestamp } = useNostrFilterTimestamps();

  const getEvent = useCallback(
    async (id: string) => {
      const queryKey = ["nostr-event", id];

      // Check cache first
      const cachedEvent = queryClient.getQueryData<Event>(queryKey);
      if (cachedEvent) return cachedEvent;

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

  const cacheEvent = useCallback(
    (event: Event) => {
      queryClient.setQueryData(["nostr-event", event.id], event);
    },
    [queryClient],
  );

  const cacheEvents = useCallback(
    (events: Event[]) => {
      events.forEach((event) => {
        queryClient.setQueryData(["nostr-event", event.id], event);
      });
    },
    [queryClient],
  );

  // startup queries
  const { data } = useQuery({
    queryKey: ["initial-load", pubkey],
    queryFn: async () => {
      if (!pubkey)
        return {
          follows: [],
          mentionEvents: [],
        };

      try {
        const mentionsFilter = {
          ...MENTIONS_FILTER,
          "#p": [pubkey],
        };
        const mentionEvents = await pool.querySync(
          readRelayList,
          mentionsFilter,
        );
        setTimestamp(MENTIONS_FILTER);
        cacheEvents(mentionEvents);
        const followsMap = await getFollowsListMap(pubkey, readRelayList);
        const follows = followsMap ? Object.keys(followsMap) : [];
        pool.subscribeMany(
          readRelayList,
          [
            {
              ...METADATA_FILTER,
              authors: [pubkey, ...(follows.length ? follows : [])],
            },
          ],
          {
            onevent: (event) => {
              const queryKey = useNostrProfileQueryKey(event.pubkey);
              queryClient.setQueryData(queryKey, decodeProfileMetadata(event));
            },
          },
        );

        return {
          follows,
          followsMap,
          mentionEvents,
        };
      } catch (error) {
        console.error("Initial load error:", error);
        return {
          follows: [],
          mentionEvents: [],
        };
      }
    },
    enabled: Boolean(pubkey),
    retry: false,
  });

  return (
    <NostrEventContext.Provider
      value={{
        getEvent,
        cacheEvent,
        cacheEvents,
        mentionEvents: data?.mentionEvents ?? [],
        follows: data?.follows ?? [],
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
