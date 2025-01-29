import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { nostrQueryKeys, useNostrEvents } from "@/providers/NostrEventProvider";

interface UseEventRelatedEvents {
  reactions: Event[];
  replies: Event[];
  reposts: Event[];
  genericReposts: Event[];
  zapsReceipts: Event[];
  isLoading: boolean;
  error: unknown;
  addEventToCache: (event: Event) => void;
  refetch: () => void;
}

export const useEventRelatedEvents = (event: Event): UseEventRelatedEvents => {
  const { getEventRelatedEvents } = useNostrEvents();
  const queryClient = useQueryClient();
  const queryKey = nostrQueryKeys.eventRelatedEvents(event.id);

  const {
    data: events = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const events = await getEventRelatedEvents(event);
      const kindMap = new Map<number, Set<Event>>();

      for (const event of events) {
        const eTag = event.tags.find(([tag]) => tag === "e");
        const eventId = eTag?.[1];

        if (!eventId) continue;

        if (!kindMap.has(event.kind)) {
          kindMap.set(event.kind, new Set());
        }

        kindMap.get(event.kind)!.add(event);
      }

      const oldCache =
        queryClient.getQueryData<Record<number, Event[]>>(queryKey) ?? {};

      const newData: Record<number, Event[]> = { ...oldCache };

      for (const [kind, events] of kindMap.entries()) {
        const existingEvents = new Set(oldCache[kind] ?? []);
        for (const event of events) {
          existingEvents.add(event);
        }
        newData[kind] = Array.from(existingEvents);
      }

      return newData;
    },

    enabled: Boolean(event),
  });

  const addEventToCache = (event: Event) => {
    queryClient.setQueryData(queryKey, (old: Record<number, Event[]> = {}) => {
      const kindEvents = old[event.kind] ?? [];
      return {
        ...old,
        [event.kind]: [...kindEvents, event],
      };
    });
  };

  return {
    replies: events[1] ?? [],
    reactions: events[7] ?? [],
    reposts: events[6] ?? [],
    genericReposts: events[16] ?? [],
    zapsReceipts: events[9735] ?? [],
    isLoading,
    error,
    addEventToCache,
    refetch,
  };
};
