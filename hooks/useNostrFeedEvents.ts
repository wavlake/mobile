import { Event } from "nostr-tools";
import { useQuery } from "@tanstack/react-query";

export const getFeedEventsQueryKey = (pubkey?: string | null) => [
  "feed-events",
  pubkey,
];

export const useNostrFeedEvents = (pubkey?: string | null) => {
  const data = useQuery<Event[]>({
    queryKey: getFeedEventsQueryKey(pubkey),
    // Start with empty array, will be populated by useInitialNostrLoad
    queryFn: () => [],
    enabled: Boolean(pubkey),
    staleTime: 10000,
  });

  return data;
};
