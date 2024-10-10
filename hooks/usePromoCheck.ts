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

const CACHE_STALE_TIME = 5 * 1000; // 5 seconds

export const usePromoCheck = (contentId?: string | boolean) => {
  const { state: playbackState } = usePlaybackState();
  const { user } = useUser();
  const promoListQueryKey = getUsePromoQueryKey(user?.uid);
  const queryClient = useQueryClient();

  return useQuery<Promo | null>({
    queryKey: ["promoCheck", contentId],
    queryFn: async () => {
      if (typeof contentId !== "string") return null;
      queryClient.invalidateQueries(promoListQueryKey);
      // First, try to get data from cache
      const cachedData = await getCachedPromoData(contentId);
      const now = Date.now();

      // If cache is fresh (less than 5 seconds old), use it
      if (cachedData && now - cachedData.timestamp < CACHE_STALE_TIME) {
        return cachedData;
      }

      // If cache is stale or doesn't exist, fetch from API
      const apiData = await getPromoByContentId(contentId);

      // Update cache with new data
      await cachePromoData(apiData);

      return apiData;
    },
    enabled: Boolean(contentId),
    refetchInterval: (data) => {
      // no need to refetch if not playing
      if (playbackState !== "playing") return false;

      if (data?.promoUser.canEarnToday) return CACHE_STALE_TIME;

      // stop refetching if no rewards remaining
      return false;
    },
  });
};
