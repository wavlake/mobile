import { useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { nostrQueryKeys, useNostrEvents } from "@/providers";

export const useNostrEvent = (eventId: string) => {
  const { getEventFromId } = useNostrEvents();

  return useQuery<Event | null>({
    queryKey: nostrQueryKeys.event(eventId),
    queryFn: () => getEventFromId(eventId),
    enabled: Boolean(eventId),
  });
};
