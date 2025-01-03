import { Event, Filter } from "nostr-tools";
import { useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueries } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { pool } from "@/utils/relay-pool";
import { useNostrRelayList } from "./nostrRelayList";
import { useCacheNostrEvent } from "./useNostrEvent";

interface RelatedEventsQueries {
  directReplies: Array<Event>;
  mentions: Array<Event>;
  // TODO - Implement direct messages
  // dms: Array<{ event: Event; isUnread: boolean }>;
  contentReplies: Array<Event>;
  lastReadDate: number | undefined;
  hasUnreadMessages: boolean;
}

const CONTENT_ID_PREFIX = "podcast:item:guid:";

// API client functions
const fetchLastInboxDate = async (): Promise<number> => {
  return Date.now();
  const response = await fetch("/api/account/inbox");
  const data = await response.json();
  if (!data.success) {
    throw new Error("Failed to fetch last inbox date");
  }
  return data.lastInboxDate;
};

const updateLastInboxDate = async (timestamp: number): Promise<void> => {
  return;
  const response = await fetch("/api/account/inbox", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ timestamp }),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error("Failed to update last inbox date");
  }
};

// contentIds is a list of content owned by the logged in user
export const useInbox = (
  contentIds: string[] = [],
  options = {
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  },
) => {
  const cacheEvent = useCacheNostrEvent();
  const { readRelayList } = useNostrRelayList();
  const { userIsLoggedIn, pubkey } = useAuth();
  const componentMountedAt = useRef(Date.now());

  // Fetch last read date
  const lastReadQuery = useQuery({
    queryKey: ["inbox", "lastRead"],
    queryFn: fetchLastInboxDate,
    enabled: userIsLoggedIn,
  });

  // Mutation to update last read date
  const updateLastReadMutation = useMutation({
    mutationFn: updateLastInboxDate,
  });

  // Update last read date when component mounts
  useEffect(() => {
    if (userIsLoggedIn) {
      updateLastReadMutation.mutate(componentMountedAt.current);
    }
  }, [userIsLoggedIn]);

  // Format content IDs with prefix for I tag
  const formattedContentIds = useMemo(
    () => contentIds.map((id) => `${CONTENT_ID_PREFIX}${id}`),
    [contentIds],
  );
  const validateMentions = (events: Event[]): Event[] => {
    return events.filter((event) => {
      const mentionTagIndices = event.tags
        .map((tag, index) => (tag[0] === "p" && tag[1] === pubkey ? index : -1))
        .filter((index) => index !== -1);

      return mentionTagIndices.some((index) =>
        event.content.includes(`#[${index}]`),
      );
    });
  };

  const userHasContent = contentIds.length > 0;
  // Create filters for different types of related events
  const filters = useMemo(() => {
    const repliesAndMentions: Filter = {
      kinds: [1],
      limit: 100,
      "#p": [pubkey],
    };

    const contentReplies: Filter = {
      kinds: [1],
      limit: 100,
      "#i": formattedContentIds,
    };

    return {
      repliesAndMentions,
      // TODO - Direct messages to the user
      // dms: {
      //   kinds: [4],
      //   "#p": [pubkey],
      // } as Filter,
      contentReplies,
    };
  }, [pubkey, formattedContentIds]);

  // Only add content replies query if there are contentIds
  const allQueries = useMemo(() => {
    return [
      {
        queryKey: ["nostr", "replies-and-mentions", pubkey],
        queryFn: async () => {
          if (!pubkey) return { replies: [], mentions: [] };
          const events = await pool.querySync(
            readRelayList,
            filters.repliesAndMentions,
          );
          console.log("replies-and-mentions", events.length);
          events.forEach(cacheEvent);

          // Split events into replies and mentions
          const mentions = validateMentions(events);
          const mentionIds = new Set(mentions.map((e) => e.id));

          const replies = events.filter((event) => !mentionIds.has(event.id));

          return {
            replies: replies.filter(
              (reply) =>
                reply.pubkey !==
                "d5475b24841e54e51087a09b067c9639bea1c8a530256a8f5412589c8098e1c4",
            ),
            mentions: mentions.filter(
              (mention) =>
                mention.pubkey !==
                "d5475b24841e54e51087a09b067c9639bea1c8a530256a8f5412589c8098e1c4",
            ),
          };
        },
        ...options,
      },
      // TODO - Implement direct messages
      // {
      //   queryKey: ["nostr", "related", "dms", pubkey],
      //   queryFn: async () => {
      //     const events = await pool.querySync(readRelayList, filters.dms);
      //     return events.map((event) => event.id);
      //   },
      //   ...options,
      // },
      {
        queryKey: ["nostr", "related", "content-replies", contentIds],
        queryFn: async () => {
          // skip an empty filter
          if (!userHasContent) return [];
          const events = await pool.querySync(
            readRelayList,
            filters.contentReplies,
          );
          events.forEach(cacheEvent);

          return events;
        },
        ...options,
      },
    ];
  }, [contentIds, filters.contentReplies, readRelayList, options, pubkey]);

  // Setup queries
  const queries = useQueries({ queries: allQueries });
  const { replies, mentions } = (queries[0]?.data as {
    mentions: Event[];
    replies: Event[];
  }) || { mentions: [], replies: [] };
  const contentReplies = (queries[1]?.data as Event[]) || [];
  // Organize results into a structured object
  const results = useMemo<RelatedEventsQueries>(
    () => ({
      directReplies: replies || [],
      mentions: mentions || [],
      // dms: queries[1]?.data || [],
      contentReplies: contentReplies || [],
      lastReadDate: lastReadQuery.data,
      hasUnreadMessages: false,
    }),
    [queries],
  );

  // Aggregate loading and error states
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const errors = queries
    .filter((query) => query.error)
    .map((query) => query.error);

  // Cleanup function
  const cleanup = () => {
    pool.close(readRelayList);
  };

  return {
    ...results,
    isLoading,
    isError,
    errors,
    cleanup,
    // Expose helper for consistency
    formatContentId: (id: string) => `${CONTENT_ID_PREFIX}${id}`,
    // Expose mention validation helper
    validateMentions,
    refetch: () => {
      queries.forEach((query) => query.refetch());
    },
  };
};
