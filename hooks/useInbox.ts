import { Event } from "nostr-tools";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useGetInboxLastRead } from "./useGetInboxLastRead";
import { useAccountTracks } from "./useAccountTracks";
import { useSetInboxLastRead } from "./useSetInboxLastRead";
import {
  mergeEventsIntoCache,
  nostrQueryKeys,
  useNostrEvents,
} from "@/providers";
import { getQueryTimestamp, updateQueryTimestamp } from "@/utils";
import { useEffect } from "react";

const CONTENT_ID_PREFIX = "podcast:item:guid:";

export const useInbox = () => {
  const { pubkey } = useAuth();
  const queryClient = useQueryClient();
  const { querySync, cacheEventsById, updateInboxCache } = useNostrEvents();

  useEffect(() => {
    updateInboxCache();
  }, [pubkey]);

  // Fetch last read date
  const { refetch: getLastRead, data: lastReadDate } = useGetInboxLastRead();
  // convert lastReadDate from datetime string to number
  const lastReadDateNumber = lastReadDate
    ? Math.trunc(new Date(lastReadDate).getTime() / 1000)
    : undefined;
  const { mutateAsync: updateLastRead } = useSetInboxLastRead();

  // tracks is a list of tracks owned by the logged in user
  const {
    data: tracks = [],
    isPending: loadingAccountTracks,
    refetch: refetchAccountTracks,
  } = useAccountTracks();

  const { data: comments = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.pTagComments(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const contentCommentQueryKey = nostrQueryKeys.pubkeyITagComments(
    pubkey ?? "",
  );
  const userHasContent = tracks.length > 0;
  const {
    data: contentComments = [],
    refetch: refetchContentComments,
    isPending: loadingContentComments,
  } = useQuery({
    queryKey: contentCommentQueryKey,
    queryFn: async () => {
      if (!userHasContent) {
        return [];
      }

      // Format content IDs with prefix for I tag
      const contentIds = tracks.map((track) => track.id);
      const iTagFormattedIds = contentIds.map(
        (id) => `${CONTENT_ID_PREFIX}${id}`,
      );
      // skip an empty filter
      const since = getQueryTimestamp(queryClient, contentCommentQueryKey);
      const filter = {
        kinds: [1],
        limit: 100,
        "#i": iTagFormattedIds,
        since,
      };

      const events = await querySync(filter);

      cacheEventsById(events);

      const contentIdEventListMap = events.reduce(
        (acc, event) => {
          const contentId = event.tags.find((tag) => tag[0] === "i")?.[1];
          if (contentId) {
            acc[contentId] = acc[contentId] || [];
            acc[contentId].push(event);
          }
          return acc;
        },
        {} as Record<string, Event[]>,
      );
      Object.entries(contentIdEventListMap).forEach(([contentId, events]) => {
        const queryKey = nostrQueryKeys.iTagComments(contentId);
        updateQueryTimestamp(queryClient, queryKey, events);
        const oldCache = queryClient.getQueryData<Event[]>(queryKey);
        const newCache = mergeEventsIntoCache(events, oldCache);
        queryClient.setQueryData(queryKey, newCache);
      });
      const oldCache = queryClient.getQueryData<Event[]>(
        contentCommentQueryKey,
      );

      return mergeEventsIntoCache(events, oldCache);
    },
  });

  const { data: reactions = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.pTagReactions(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  const { data: zapReceipts = [] } = useQuery<Event[]>({
    queryKey: nostrQueryKeys.pTagZapReceipts(pubkey ?? ""),
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

  return {
    comments,
    contentComments,
    reactions,
    zapReceipts,
    reposts,
    genericReposts,
    refetch: async () => {
      refetchAccountTracks();
      refetchContentComments();
      getLastRead();
      updateInboxCache();
    },
    isLoading: loadingAccountTracks || loadingContentComments,
    updateLastRead,
    lastReadDate: lastReadDateNumber,
    userHasContent,
  };
};
