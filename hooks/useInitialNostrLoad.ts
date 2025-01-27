import { Event, Filter } from "nostr-tools";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pool } from "@/utils/relay-pool";
import { useNostrRelayList } from "./nostrRelayList";
import { useCacheEvents } from "./useCacheEvents";
import { encodeNpub, getFollowsListMap } from "@/utils";
import { useNostrFilterTimestamps } from "./useNostrFilterTimestamps";
import { useNostrProfileQueryKey } from "./nostrProfile/useNostrProfileQueryKey";
import { decodeProfileMetadata } from "./nostrProfile";
import { getFeedEventsQueryKey } from "./useNostrFeedEvents";
import { getFeedInteractionsQueryKey } from "./useNostrFeedInteractions";
import { useNostrEvents } from "@/providers/NostrEventProvider";

const MENTIONS_FILTER: Filter = {
  // kinds: [1, 6, 16, 7, 9735, 30023],
  kinds: [1],
  limit: 51,
};

const METADATA_FILTER: Filter = {
  kinds: [0],
};

const FOLLOWS_FILTER: Filter = {
  // 3: Follow list
  // 10000: mute list
  // 10030: emoji list
  kinds: [3, 10000, 10030],
};

const FEED_FILTER: Filter = {
  kinds: [1, 6, 16],
  limit: 52,
};

type InitialNostrLoadData = {
  follows: string[];
  mentionEvents: Event[];
};

export const getInitialLoadQueryKey = (pubkey?: string | null) => [
  "initial-load",
  pubkey,
];
export const useInitialNostrLoad3 = (pubkey?: string | null) => {
  const data = useQuery<Event[]>({
    queryKey: getInitialLoadQueryKey(pubkey),
    // Start with empty array, will be populated by useInitialNostrLoad
    queryFn: () => [],
    enabled: Boolean(pubkey),
    staleTime: 10000,
  });

  return data;
};

export const useInitialNostrLoad2 = (pubkey?: string | null) => {
  const { readRelayList } = useNostrRelayList();
  const { cacheEvents } = useNostrEvents();
  const queryClient = useQueryClient();
  const { getTimestamp, setTimestamp } = useNostrFilterTimestamps();

  // Check if we already have data in the cache
  const queryKey = getInitialLoadQueryKey(pubkey);
  const cachedData = queryClient.getQueryData(queryKey) as InitialNostrLoadData;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!pubkey) return null;

      try {
        // 1. Fetch mentions and interactions
        const mentionsFilter = {
          ...MENTIONS_FILTER,
          "#p": [pubkey],
          // since: getTimestamp(MENTIONS_FILTER),
        };
        const mentionEvents = await pool.querySync(
          readRelayList,
          mentionsFilter,
        );
        setTimestamp(MENTIONS_FILTER);
        cacheEvents(mentionEvents);

        // 2. Fetch follows and lists
        let follows: string[] = [];
        const followsMap = await getFollowsListMap(pubkey, readRelayList);
        follows = followsMap ? Object.keys(followsMap) : [];

        // Cache follows for other components to use
        queryClient.setQueryData(["followsMap", pubkey], followsMap);
        queryClient.setQueryData(["follows", pubkey], follows);

        // Subscribe to follow list updates
        pool.subscribeMany(
          readRelayList,
          [{ ...FOLLOWS_FILTER, authors: [pubkey] }],
          {
            onevent: async (event) => {
              if (event.kind === 3) {
                // Update follows cache when new follow list received
                const newFollowsMap = await getFollowsListMap(
                  pubkey,
                  readRelayList,
                );
                queryClient.setQueryData(
                  ["follows", pubkey],
                  Object.keys(newFollowsMap || {}),
                );
                queryClient.setQueryData(["followsMap", pubkey], newFollowsMap);
              }
            },
          },
        );

        // 5. Fetch feed from follows
        if (follows?.length) {
          const feedFilter = {
            ...FEED_FILTER,
            authors: follows,
          };
          const feedEvents = await pool.querySync(readRelayList, feedFilter);
          cacheEvents(feedEvents);

          // Set feed events in cache
          queryClient.setQueryData(getFeedEventsQueryKey(pubkey), feedEvents);

          // Handle interactions for initial feed events
          const initialNotes = feedEvents
            .filter((e) => e.kind === 1)
            .slice(0, 20)
            .map((e) => e.id);

          if (initialNotes.length) {
            pool.subscribeMany(
              readRelayList,
              [
                {
                  kinds: [9735, 7, 16, 6],
                  "#e": initialNotes,
                },
              ],
              {
                onevent: (event) => {
                  cacheEvents([event]);
                  // Update interactions cache
                  queryClient.setQueryData<Event[]>(
                    getFeedInteractionsQueryKey(pubkey),
                    (old = []) => [...old, event],
                  );
                },
              },
            );
          }
        }

        // 7. Subscribe to profile metadata updates
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
        console.log("initialLoad:", {
          follows: follows.length,
          mentionEvents: mentionEvents.length,
        });
        return {
          follows,
          mentionEvents,
        };
      } catch (error) {
        console.error("useInitialNostrLoad ERROR:", error);
        return {
          follows: [],
          mentionEvents: [],
        };
      }
    },
    enabled: Boolean(pubkey),
    staleTime: 10000,
    gcTime: 10000,
    initialData: cachedData,
    refetchOnMount: !cachedData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2, // limit retries on error
  });
};
