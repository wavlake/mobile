import { getFollowsListMap } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const getNostrFollowsQueryKey = (pubkey?: string | null) => {
  return ["follows", pubkey];
};

export const useNostrFollows = (pubkey?: string | null) => {
  return useQuery({
    queryKey: getNostrFollowsQueryKey(pubkey),
    queryFn: () => {
      if (!pubkey) return [];
      const followsMap = getFollowsListMap(pubkey);
      return Object.keys(followsMap);
    },
    enabled: Boolean(pubkey),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};
