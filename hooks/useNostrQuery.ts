import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { nostrQueryKeys } from "@/providers";

// Helper to check if a query key is a Nostr query
function isNostrQueryKey(queryKey: readonly unknown[]): boolean {
  // Check if the first element is "nostr"
  return Array.isArray(queryKey) && queryKey[0] === "nostr";
}

// Type to represent all possible return types from nostrQueryKeys
type NostrQueryKeyReturn = ReturnType<
  (typeof nostrQueryKeys)[keyof typeof nostrQueryKeys]
>;

export function useNostrQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData>,
): UseQueryResult<TData, TError> {
  const queryClient = useQueryClient();
  // Verify this is a Nostr query key
  if (!isNostrQueryKey(options.queryKey)) {
    throw new Error("useNostrQuery must be used with a Nostr query key");
  }

  // Apply Nostr-specific cache settings
  return useQuery({
    // allow staleTime to be overwritten by options
    staleTime: Infinity,
    ...options,
    queryKey: options.queryKey as NostrQueryKeyReturn,
    // cache nostr events indefinitely
    gcTime: Infinity,
  });
}
