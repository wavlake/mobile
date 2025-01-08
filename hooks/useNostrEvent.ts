import { getEventById } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Event } from "nostr-tools";
export const getNostrEventQueryKey = (nostrEventId?: string | null) => {
  return ["event", nostrEventId];
};

export const useNostrEvent = (eventId: string) => {
  const queryKey = getNostrEventQueryKey(eventId);
  return useQuery({
    queryKey,
    queryFn: async () => getEventById(eventId),
    staleTime: Infinity,
    enabled: Boolean(eventId),
  });
};

export const useCacheNostrEvent = () => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    return (event: Event) => {
      const queryKey = getNostrEventQueryKey(event.id);
      queryClient.setQueryData(queryKey, event);
    };
  }, [queryClient]);
};
