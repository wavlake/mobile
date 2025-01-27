import { Event } from "nostr-tools";
import { useQuery } from "@tanstack/react-query";

export const getFeedInteractionsQueryKey = (pubkey?: string | null) => [
  "feed-interactions",
  pubkey,
];

export const useNostrFeedInteractions = (pubkey?: string | null) => {
  const data = useQuery<Event[]>({
    queryKey: getFeedInteractionsQueryKey(pubkey),
    // Start with empty array, will be populated by useInitialNostrLoad
    queryFn: () => [],
    enabled: Boolean(pubkey),
    staleTime: 10000,
  });

  return data;
};
