import { useQuery } from "@tanstack/react-query";
import {
  getPromoByContentId,
  getCachedPromoData,
  Promo,
  cachePromoData,
} from "@/utils";

const CACHE_STALE_TIME = 30 * 1000; // 30 seconds
const API_REFRESH_INTERVAL = 60 * 1000; // 60 seconds

export const usePromoCheck = (contentId?: string | boolean) => {
  return useQuery<Promo | null>({
    queryKey: ["promoCheck", contentId],
    queryFn: async () => {
      if (typeof contentId !== "string") return null;

      // First, try to get data from cache
      const cachedData = await getCachedPromoData(contentId);
      const now = Date.now();

      // If cache is fresh (less than 30 seconds old), use it
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
    staleTime: CACHE_STALE_TIME,
    refetchInterval: API_REFRESH_INTERVAL,
  });
};
