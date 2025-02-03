import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, UseQueryOptions } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Event } from "nostr-tools";
import { KindEventCache, mergeEventsIntoCache } from "@/utils";

const FIVE_MINS = 1000 * 60 * 5; // 5 minutes
const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24; // 24 hours

// Configure the AsyncStorage persister
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "REACT_QUERY_CACHE",
});

// Type for queries that use the event cache structure
export interface NostrQueryOptions {
  useEventCache?: boolean;
  filterKinds?: number[];
}

// Create the query client with default structural sharing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: TWENTY_FOUR_HOURS,
      staleTime: FIVE_MINS,
      // Default structural sharing for all queries
      // structuralSharing: (oldData: unknown, newData: unknown) => {
      //   return newData;
      // },
    },
  },
});

// Higher-order function to generate query options for nostr event queries
export function createNostrQueryOptions<TData = unknown, TError = unknown>(
  options: NostrQueryOptions & Partial<UseQueryOptions<TData, TError>> = {},
) {
  const { useEventCache, filterKinds, ...restOptions } = options;

  if (!useEventCache) {
    return restOptions;
  }

  return {
    ...restOptions,
    structuralSharing: (oldData: unknown, newData: unknown) => {
      // Only apply event cache merging if both types match our expected structure
      if (Array.isArray(newData)) {
        const typedOldData = oldData as KindEventCache | undefined;
        const typedNewData = newData as Event[];

        return mergeEventsIntoCache(
          typedNewData,
          typedOldData ?? {},
          filterKinds,
        );
      }
      return newData;
    },
  };
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: TWENTY_FOUR_HOURS * 7,
        buster: "v1", // Change this when you need to invalidate all caches
        // dehydrateOptions: {
        //   // Customize what gets persisted
        //   shouldDehydrateQuery: (query) => {
        //     // Only persist queries that opt-in
        //     return (
        //       query.state.data !== undefined && query.options.persist === true
        //     );
        //   },
        // },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
