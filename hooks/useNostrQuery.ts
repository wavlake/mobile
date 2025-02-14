import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

// Helper to check if a query key is a Nostr query
function isNostrQueryKey(queryKey: readonly unknown[]): boolean {
  // Check if the first element is "nostr"
  return Array.isArray(queryKey) && queryKey[0] === "nostr";
}

export function useNostrQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData>,
): UseQueryResult<TData, TError> {
  // Verify this is a Nostr query key
  if (!isNostrQueryKey(options.queryKey)) {
    throw new Error("useNostrQuery must be used with a Nostr query key");
  }

  // Apply Nostr-specific cache settings
  return useQuery({
    ...options,
    // cache nostr events indefinitely
    gcTime: Infinity,
    staleTime: Infinity,
  });
}
