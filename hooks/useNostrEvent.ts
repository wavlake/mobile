import { Event } from "nostr-tools";
import { nostrQueryKeys, useNostrEvents } from "@/providers";
import { useNostrQuery } from "./useNostrQuery";

export const useNostrEvent = (eventId?: string | null) => {
  const { getEventFromId } = useNostrEvents();

  return useNostrQuery<Event | null>({
    queryKey: nostrQueryKeys.event(eventId ?? ""),
    queryFn: () =>
      typeof eventId === "string" ? getEventFromId(eventId) : null,
    enabled: Boolean(eventId),
  });
};
