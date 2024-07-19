import { useQuery } from "@tanstack/react-query";
import { fetchReplies } from "@/utils";

export const useRepliesQueryKey = (nostrEventId?: string | null) => {
  return ["replies", nostrEventId];
};

export const useReplies = (nostrEventId?: string | null) => {
  const queryKey = useRepliesQueryKey(nostrEventId);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!nostrEventId) return [];

      const replies = await fetchReplies([nostrEventId]);
      return replies;
    },
    enabled: Boolean(nostrEventId),
    // 10 minutes
    staleTime: 600000,
  });
};
