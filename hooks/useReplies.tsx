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
      return fetchReplies([nostrEventId]);
    },
    enabled: Boolean(nostrEventId),
    staleTime: 1000 * 60 * 10,
  });
};
