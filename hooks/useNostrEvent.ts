import { Event } from "nostr-tools";
import { nostrQueryKeys, useNostrEvents } from "@/providers";
import { useNostrQuery } from "./useNostrQuery";

export const useNostrEvent = (eventId?: string | null, relays?: string[]) => {
  const { getEventFromId } = useNostrEvents();

  return useNostrQuery<Event | null>({
    queryKey: nostrQueryKeys.event(eventId ?? ""),
    queryFn: () =>
      typeof eventId === "string" ? getEventFromId(eventId, relays) : null,
    enabled: Boolean(eventId),
  });
};
