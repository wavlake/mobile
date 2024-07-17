import { useQuery } from "@tanstack/react-query";
import { fetchReplies } from "@/utils";

export const useRepliesQueryKey = (kind1EventId?: string | null) => {
  return ["replies", kind1EventId];
};

export const useReplies = (kind1EventId?: string | null) => {
  const queryKey = useRepliesQueryKey(kind1EventId);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!kind1EventId) return [];

      const replies = await fetchReplies([kind1EventId]);
      return replies;
    },
    enabled: Boolean(kind1EventId),
    staleTime: Infinity,
  });
};
