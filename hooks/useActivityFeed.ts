import { useQuery } from "@tanstack/react-query";
import { getActivityFeed } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useActivityFeedQueryKey } from "./useActivityFeedQueryKey";

// get the activity feed for the logged in user
export const useActivityFeed = () => {
  const { pubkey } = useAuth();
  const queryKey = useActivityFeedQueryKey();

  return useQuery({
    queryKey,
    queryFn: () => getActivityFeed(pubkey),
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
