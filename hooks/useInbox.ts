import { Event } from "nostr-tools";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { pool } from "@/utils/relay-pool";
import { useNostrRelayList } from "./nostrRelayList";
import { useCacheNostrEvent } from "./useNostrEvent";
import {
  useAccountTracks,
  useGetInboxLastRead,
  useSetInboxLastRead,
} from "@/utils";
import { useNostrFeedEvents } from "./useNostrFeedEvents";
import { useNostrFeedInteractions } from "./useNostrFeedInteractions";
import { useNostrEvents } from "@/providers/NostrEventProvider";

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

// contentIds is a list of content owned by the logged in user
export const useInbox = (
  options = {
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  },
) => {
  const { pubkey } = useAuth();
  const { readRelayList } = useNostrRelayList();
  const cacheEvent = useCacheNostrEvent();

  const { mentionEvents } = useNostrEvents();
  const { data: feedEvents = [] } = useNostrFeedEvents(pubkey);
  const { data: feedInteractions = [] } = useNostrFeedInteractions(pubkey);

  const { data: tracks = [] } = useAccountTracks();
  const userHasContent = Boolean(tracks?.length);
  const contentIds = tracks.map((track) => `${CONTENT_ID_PREFIX}${track.guid}`);

  // Fetch last read date
  const { refetch: getLastRead, data: lastReadDate } = useGetInboxLastRead();
  const { mutateAsync: updateLastRead } = useSetInboxLastRead();

  //convert lastReadDate from datetime string to number
  const lastReadDateNumber = lastReadDate
    ? Math.trunc(new Date(lastReadDate).getTime() / 1000)
    : undefined;

  // Format content IDs with prefix for I tag
  const formattedContentIds = useMemo(
    () => contentIds.map((id) => `${CONTENT_ID_PREFIX}${id}`),
    [contentIds],
  );
  const validateMentions = (events: Event[]): Event[] => {
    console.log("validateMentions:", events.length);
    console.log(events?.[0]);
    return events.filter((event) => {
      const mentionTagIndices = event.tags
        .map((tag, index) => (tag[0] === "p" && tag[1] === pubkey ? index : -1))
        .filter((index) => index !== -1);

      return mentionTagIndices.some((index) =>
        event.content.includes(`#[${index}]`),
      );
    });
  };

  const filters = useMemo(
    () => ({
      contentReplies: {
        kinds: [1],
        limit: 100,
        "#i": formattedContentIds,
      },
    }),
    [contentIds],
  );

  // Combine feed events and interactions
  const allEvents = useMemo(() => {
    return [...feedEvents, ...feedInteractions];
  }, [feedEvents, feedInteractions]);

  const allQueries = useMemo(() => {
    return [
      {
        queryKey: ["nostr", "replies-and-mentions", pubkey],
        queryFn: async () => {
          if (!pubkey) return { replies: [], mentions: [] };

          const mentions = validateMentions(mentionEvents);
          const mentionIds = new Set(mentions.map((e) => e.id));

          const replies = mentionEvents.filter(
            (event) => !mentionIds.has(event.id),
          );
          return {
            replies,
            mentions,
          };
        },
        ...options,
      },
      {
        queryKey: ["nostr", "related", "content-replies", contentIds],
        queryFn: async () => {
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
  }, [pubkey, mentionEvents, userHasContent, contentIds, filters, options]);

  const queries = useQueries({ queries: allQueries });
  const { replies, mentions } = (queries[0]?.data as {
    mentions: Event[];
    replies: Event[];
  }) || { mentions: [], replies: [] };
  const contentReplies = (queries[1]?.data as Event[]) || [];

  const combinedEvents = [
    ...allEvents,
    ...replies,
    ...mentions,
    ...contentReplies,
  ];
  const hasUnreadMessages = lastReadDateNumber
    ? combinedEvents.some((event) => event.created_at > lastReadDateNumber)
    : combinedEvents.length > 0;

  // Organize results into a structured object
  const results = useMemo<RelatedEventsQueries>(
    () => ({
      directReplies: replies || [],
      mentions: mentions || [],
      // dms: queries[1]?.data || [],
      contentReplies: contentReplies || [],
      lastReadDate: lastReadDateNumber,
      hasUnreadMessages,
    }),
    [replies, mentions, contentReplies, lastReadDateNumber, hasUnreadMessages],
  );

  // Aggregate loading and error states
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const errors = queries
    .filter((query) => query.error)
    .map((query) => query.error);

  return {
    ...results,
    isLoading,
    isError,
    errors,
    // Expose helper for consistency
    formatContentId: (id: string) => `${CONTENT_ID_PREFIX}${id}`,
    // Expose mention validation helper
    validateMentions,
    refetch: async () => {
      queries.forEach((query) => query.refetch());
      getLastRead();
    },
    updateLastRead,
    userHasContent: contentIds.length > 0,
  };
};
