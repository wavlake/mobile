import { getEventById } from "@/utils";
import { useQuery } from "@tanstack/react-query";

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
