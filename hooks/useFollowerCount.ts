import { fetchFollowersCount } from "@/utils/nostrband";
import { useQuery } from "@tanstack/react-query";

export const useFollowersCount = (publicHex: string | undefined) => {
  return useQuery({
    queryKey: ["followerCount", publicHex],
    queryFn: () => {
      if (!publicHex) return Promise.resolve(0);
      return fetchFollowersCount(publicHex);
    },
    enabled: !!publicHex,
    staleTime: 24 * 60 * 60 * 1000, // Data considered fresh for 24 hrs
    retry: 1,
  });
};
