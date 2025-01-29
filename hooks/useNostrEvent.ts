import { getEventById } from "@/utils";
import { useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Event } from "nostr-tools";
import { nostrQueryKeys, useNostrEvents } from "@/providers/NostrEventProvider";

export const getNostrEventQueryKey = (nostrEventId?: string | null) => {
  return ["event", nostrEventId];
};

// Async utility function for prefetching events
export const prefetchNostrEvent = async (
  queryClient: QueryClient,
  eventId: string,
): Promise<Event | null> => {
  const queryKey = getNostrEventQueryKey(eventId);

  // Check if we already have this data cached
  const cachedData = queryClient.getQueryData<Event>(queryKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const event = await getEventById(eventId);
    if (event) {
      // Cache the result
      queryClient.setQueryData(queryKey, event);
    }
    return event;
  } catch (error) {
    console.error(`Error prefetching event ${eventId}:`, error);
    return null;
  }
};

// Batch prefetch utility
export const prefetchNostrEvents = async (
  queryClient: QueryClient,
  eventIds: string[],
): Promise<Map<string, Event>> => {
  const results = new Map<string, Event>();

  await Promise.all(
    eventIds.map(async (eventId) => {
      const event = await prefetchNostrEvent(queryClient, eventId);
      if (event) {
        results.set(eventId, event);
      }
    }),
  );

  return results;
};

export const useNostrEvent = (eventId: string) => {
  const { getEventAsync } = useNostrEvents();

  return useQuery<Event | null>({
    queryKey: nostrQueryKeys.event(eventId),
    queryFn: () => getEventAsync(eventId),
    enabled: Boolean(eventId),
  });
};

// Hook for manual caching
export const useCacheNostrEvent = () => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    return (event: Event) => {
      const queryKey = getNostrEventQueryKey(event.id);
      queryClient.setQueryData(queryKey, event);
    };
  }, [queryClient]);
};

// Hook for prefetching
export const usePrefetchNostrEvent = () => {
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      prefetchSingle: (eventId: string) =>
        prefetchNostrEvent(queryClient, eventId),
      prefetchMultiple: (eventIds: string[]) =>
        prefetchNostrEvents(queryClient, eventIds),
    }),
    [queryClient],
  );
};
