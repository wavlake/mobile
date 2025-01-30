import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { nostrQueryKeys, useNostrEvents } from "@/providers/NostrEventProvider";
import { useAuth } from "./useAuth";

interface UseEventRelatedEvents {
  reactions: Event[];
  replies: Event[];
  reposts: Event[];
  genericReposts: Event[];
  zapsReceipts: Event[];
  isLoading: boolean;
  error: unknown;
  userHasReacted: boolean;
  addEventToCache: (event: Event) => void;
  refetch: () => void;
}

export const useEventRelatedEvents = (event: Event): UseEventRelatedEvents => {
  const { getEventRelatedEvents } = useNostrEvents();
  const queryClient = useQueryClient();
  const queryKey = nostrQueryKeys.eventRelatedEvents(event.id);
  const { pubkey } = useAuth();
  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const events = await getEventRelatedEvents(event);
      const kindMap = new Map<number, Map<string, Event>>();

      // Process new events
      for (const event of events) {
        const eTag = event.tags.find(([tag]) => tag === "e");
        const eventId = eTag?.[1];

        if (!eventId) continue;

        if (!kindMap.has(event.kind)) {
          kindMap.set(event.kind, new Map());
        }

        // Use event.id as the key to ensure uniqueness
        kindMap.get(event.kind)!.set(event.id, event);
      }

      // Get existing cache
      const oldCache =
        queryClient.getQueryData<Record<number, Event[]>>(queryKey) ?? {};
      const newData: Record<number, Event[]> = { ...oldCache };

      // Merge existing cache with new events
      for (const [kind, eventsMap] of kindMap.entries()) {
        const existingEvents = new Map(
          (oldCache[kind] ?? []).map((event) => [event.id, event]),
        );

        // Merge existing events with new ones
        const mergedEvents = new Map([...existingEvents, ...eventsMap]);

        // Convert back to array
        newData[kind] = Array.from(mergedEvents.values());
      }

      return newData;
    },
    enabled: Boolean(event),
  });

  const addEventToCache = (event: Event) => {
    queryClient.setQueryData(queryKey, (old: Record<number, Event[]> = {}) => {
      const kindEvents = old[event.kind] ?? [];

      // Check if event already exists in cache
      const eventExists = kindEvents.some((e) => e.id === event.id);

      if (eventExists) {
        return old;
      }

      return {
        ...old,
        [event.kind]: [...kindEvents, event],
      };
    });
  };

  const userHasReacted = (events[7] ?? []).some(
    (reaction) => reaction.pubkey === pubkey,
  );

  return {
    replies: events[1] ?? [],
    reactions: events[7] ?? [],
    reposts: events[6] ?? [],
    genericReposts: events[16] ?? [],
    zapsReceipts: events[9735] ?? [],
    isLoading,
    error,
    userHasReacted,
    addEventToCache,
    refetch,
  };
};
