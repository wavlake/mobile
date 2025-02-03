import {
  QueryClient,
  QueryFunction,
  QueryFunctionContext,
  UseQueryOptions,
} from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLastQueried, mergeNostrEvents } from "@/utils/event-cachingNew";
import { Event } from "nostr-tools";

export interface NostrQueryOptions {
  useEventCache?: boolean;
  updateFilter?: boolean;
  initialLastQueried?: number;
}

export interface NostrQueryContext {
  lastQueried?: number;
}

export type NostrQueryFunctionContext = QueryFunctionContext & {
  queryContext?: NostrQueryContext;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      structuralSharing: (oldData: any, newData: any) => {
        if (Array.isArray(oldData) && Array.isArray(newData)) {
          return mergeNostrEvents(oldData, newData);
        }
        return newData;
      },
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "NOSTR_QUERY_CACHE",
});

export function createNostrQueryOptions<TData = Event[], TError = unknown>(
  options: NostrQueryOptions &
    Partial<UseQueryOptions<TData, TError, TData, any[]>> = {},
) {
  const {
    useEventCache = true,
    updateFilter = true,
    initialLastQueried,
    ...restOptions
  } = options;

  if (!useEventCache) {
    return restOptions;
  }

  const queryFn: UseQueryOptions<
    TData,
    TError,
    TData,
    any[]
  >["queryFn"] = async (context) => {
    if (!restOptions.queryFn) {
      throw new Error("queryFn is required when using nostr query options");
    }

    const nostrContext = context as NostrQueryFunctionContext;
    const currentFilter = context.queryKey[context.queryKey.length - 1];

    if (updateFilter && typeof currentFilter === "object") {
      // Get the lastQueried from context or initialLastQueried
      const lastQueried = Math.max(
        nostrContext.queryContext?.lastQueried ?? initialLastQueried ?? 0,
      );

      const updatedFilter = {
        ...currentFilter,
        since: Math.max(currentFilter?.since || 0, lastQueried),
      };

      const originalQueryFn = restOptions.queryFn as QueryFunction<
        TData,
        any[]
      >;
      const newEvents = (await originalQueryFn({
        ...context,
        queryKey: [...context.queryKey.slice(0, -1), updatedFilter],
      })) as Event[];

      // Update the context with the new lastQueried from the fetched events
      const newLastQueried = getLastQueried(newEvents);
      if (newLastQueried > 0) {
        (nostrContext as any).queryContext = {
          lastQueried: newLastQueried,
        };
      }

      return newEvents as TData;
    }

    return (restOptions.queryFn as QueryFunction<TData, any[]>)(context);
  };

  return {
    ...restOptions,
    queryFn,
    structuralSharing: (oldData: unknown, newData: unknown) => {
      if (Array.isArray(newData)) {
        const typedOldData = oldData as Event[];
        const typedNewData = newData as Event[];
        return mergeNostrEvents(typedOldData, typedNewData);
      }
      return newData;
    },
  };
}
