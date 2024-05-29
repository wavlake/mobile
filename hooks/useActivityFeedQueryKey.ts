import { useAuth } from "@/hooks/useAuth";

export const useActivityFeedQueryKey = () => {
  const { pubkey } = useAuth();

  return ["activityFeed", pubkey];
};
