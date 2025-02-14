import { Event } from "nostr-tools";
import { useQueryClient } from "@tanstack/react-query";
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
import { useNostrQuery } from "./useNostrQuery";
import { useSocialEvents } from "./useSocialEvents";

const CONTENT_ID_PREFIX = "podcast:item:guid:";

export const useInbox = () => {
  const { pubkey } = useAuth();
  const queryClient = useQueryClient();
  const { querySync, cacheEventsById } = useNostrEvents();

  const { data: socialEvents = [], refetch: refetchSocialEvents } =
    useSocialEvents(pubkey);

  // Fetch last read date
  const { refetch: getLastRead, data: lastReadDate } = useGetInboxLastRead();
  const lastReadDateNumber = lastReadDate
    ? Math.trunc(new Date(lastReadDate).getTime() / 1000)
    : undefined;
  const { mutateAsync: updateLastRead } = useSetInboxLastRead();

  const {
    data: tracks = [],
    isPending: loadingAccountTracks,
    refetch: refetchAccountTracks,
  } = useAccountTracks();

  const contentCommentQueryKey = nostrQueryKeys.pubkeyITagComments(
    pubkey ?? "",
  );
  const userHasContent = tracks.length > 0;
  const {
    data: contentComments = [],
    refetch: refetchContentComments,
    isPending: loadingContentComments,
  } = useNostrQuery({
    queryKey: contentCommentQueryKey,
    queryFn: async () => {
      if (!userHasContent) {
        return [];
      }

      const contentIds = tracks.map((track) => track.id);
      const iTagFormattedIds = contentIds.map(
        (id) => `${CONTENT_ID_PREFIX}${id}`,
      );
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
    refetchOnMount: "always",
  });

  return {
    socialEvents,
    contentComments,
    refetch: async () => {
      refetchAccountTracks();
      refetchContentComments();
      getLastRead();
      refetchSocialEvents();
    },
    isLoading: loadingAccountTracks || loadingContentComments,
    updateLastRead,
    lastReadDate: lastReadDateNumber,
    userHasContent,
  };
};
