import { Event } from "nostr-tools";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { pool } from "@/utils/relay-pool";
import { useNostrRelayList } from "./nostrRelayList";
import { useGetInboxLastRead } from "./useGetInboxLastRead";
import { useAccountTracks } from "./useAccountTracks";
import { useSetInboxLastRead } from "./useSetInboxLastRead";
import { useNostrEvents } from "@/providers";

const CONTENT_ID_PREFIX = "podcast:item:guid:";

// contentIds is a list of content owned by the logged in user
export const useInbox = (
  options = {
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  },
) => {
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const {
    comments,
    reactions,
    zapReceipts,
    cacheEventsById,
    loadInitialData: loadNostrEvents,
  } = useNostrEvents();

  const {
    data: tracks = [],
    isLoading: isLoadingAccountTracks,
    refetch: refetchAccountTracks,
  } = useAccountTracks();
  const contentIds = tracks.map((track) => track.id);
  const { readRelayList } = useNostrRelayList();
  const { pubkey } = useAuth();

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

  // Only add content replies query if there are contentIds
  const {
    data: contentComments = [],
    refetch: refetchContentComments,
    isFetching,
  } = useQuery({
    queryKey: ["nostr", "content-replies", contentIds],
    queryFn: async () => {
      // skip an empty filter
      if (!userHasContent) return [];
      const events = await pool.querySync(readRelayList, {
        kinds: [1],
        limit: 100,
        "#i": formattedContentIds,
      });
      cacheEventsById(events);
      return events;
    },
    ...options,
    enabled: userHasContent,
  });

  const loadInitialData = async () => {
    setIsLoadingInitial(true);
    try {
      await loadNostrEvents();
      await refetchAccountTracks();
      await refetchContentComments();
      await getLastRead();
    } catch (error) {
      console.error("Error loading initial inbox data:", error);
    } finally {
      setIsLoadingInitial(false);
    }
  };

  // Cleanup function
  const cleanup = () => {
    pool.close(readRelayList);
  };

  return {
    comments: comments,
    contentComments: contentComments,
    reactions: reactions,
    zapReceipts: zapReceipts,
    cleanup,
    // Expose mention validation helper
    validateMentions,
    refetch: async () => {
      refetchAccountTracks();
      refetchContentComments();
      getLastRead();
    },
    isLoading: isLoadingInitial || isLoadingAccountTracks || isFetching,
    updateLastRead,
    lastReadDate: lastReadDateNumber,
    userHasContent: contentIds.length > 0,
    loadInitialData,
    isLoadingInitial,
  };
};
