import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPromoByContentId,
  getCachedPromoData,
  Promo,
  cachePromoData,
} from "@/utils";
import { usePlaybackState } from "react-native-track-player";
import { getUsePromoQueryKey } from "./usePromos";
import { useUser } from "@/components";
import { useRef, useEffect } from "react";

const CACHE_STALE_TIME = 5 * 1000; // 5 seconds

export const usePromoCheck = (contentId?: string | boolean) => {
  const { state: playbackState } = usePlaybackState();
  const { user } = useUser();
  const promoListQueryKey = getUsePromoQueryKey(user?.uid);
  const queryClient = useQueryClient();

  const shouldRefetchOnceMoreRef = useRef(false);
  const lastPlaybackStateRef = useRef(playbackState);

  useEffect(() => {
    if (
      playbackState === "playing" &&
      lastPlaybackStateRef.current !== "playing"
    ) {
      shouldRefetchOnceMoreRef.current = true;
    }
    lastPlaybackStateRef.current = playbackState;
  }, [playbackState]);

  return useQuery<Promo | null>({
    queryKey: ["promoCheck", contentId],
    queryFn: async () => {
      if (typeof contentId !== "string") return null;
      // First, try to get data from cache
      const cachedData = await getCachedPromoData(contentId);
      const now = Date.now();

      // If cache is fresh (less than 5 seconds old), use it
      if (cachedData && now - cachedData.timestamp < CACHE_STALE_TIME) {
        return cachedData;
      }

      queryClient.invalidateQueries(promoListQueryKey);
      // If cache is stale or doesn't exist, fetch from API
      const apiData = await getPromoByContentId(contentId);

      // Update cache with new data
      await cachePromoData(apiData);

      return apiData;
    },
    enabled: Boolean(contentId),
    refetchInterval: (data) => {
      // no need to refetch if not playing
      if (playbackState !== "playing") {
        // fetch one more time after playback ends
        if (shouldRefetchOnceMoreRef.current) {
          shouldRefetchOnceMoreRef.current = false;
          return CACHE_STALE_TIME;
        }
        return false;
      }

      if (data?.promoUser.canEarnToday) return CACHE_STALE_TIME;

      // stop refetching if no rewards remaining
      return false;
    },
  });
};
