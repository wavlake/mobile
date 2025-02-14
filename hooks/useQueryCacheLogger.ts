import {
  useQueryClient,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";

type LogLevel = "info" | "warn" | "error" | "debug";

interface QueryCacheLoggerOptions<TData = unknown> {
  /** Console log level to use. Defaults to 'info' */
  logLevel?: LogLevel;
  /** Whether to include mutation cache updates. Defaults to true */
  includeMutations?: boolean;
  /** Whether to include query cache updates. Defaults to true */
  includeQueries?: boolean;
  /** Custom comparison function for detecting changes. Defaults to JSON.stringify */
  compareFunction?: (data: TData) => string;
  /** Optional filter function to limit which events are logged */
  filter?: (event: QueryCacheEvent | MutationCacheEvent) => boolean;
  /** Optional array of query keys to monitor. If provided, only these queries will be logged */
  queryKeys?: (string | string[])[];
}

type QueryCacheEvent = Parameters<Parameters<QueryCache["subscribe"]>[0]>[0];
type MutationCacheEvent = Parameters<
  Parameters<MutationCache["subscribe"]>[0]
>[0];

interface CacheDiff {
  [key: string]:
    | {
        old: unknown;
        new: unknown;
      }
    | string;
}

const isDevEnvironment = (): boolean => {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test" ||
    process.env.REACT_APP_ENABLE_QUERY_LOGGER === "true"
  );
};

// Helper function to check if a query key matches our filter
const isQueryKeyMatch = (
  queryKey: readonly unknown[],
  filterKeys: (string | string[])[],
): boolean => {
  const stringifiedKey = JSON.stringify(queryKey);

  return filterKeys.some((filterKey) => {
    if (Array.isArray(filterKey)) {
      return JSON.stringify(filterKey) === stringifiedKey;
    }
    // If filterKey is a string, check if it's contained in any part of the query key
    return queryKey.some(
      (part) => typeof part === "string" && part.includes(filterKey),
    );
  });
};

// Safe deep clone function that works in React Native
const deepClone = <T>(obj: T): T => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.warn("Deep clone failed, falling back to shallow copy:", e);
    return { ...obj };
  }
};

const useQueryCacheLogger = <TData = unknown>(
  options: QueryCacheLoggerOptions<TData> = {},
): void => {
  // Early return if not in development
  if (!isDevEnvironment()) {
    return;
  }

  const queryClient = useQueryClient();
  const previousCache = useRef(new Map<string, TData>());

  const {
    logLevel = "info",
    includeMutations = true,
    includeQueries = true,
    compareFunction = JSON.stringify,
    filter = () => true,
    queryKeys = [],
  } = options;

  const compareObjects = (oldObj: unknown, newObj: unknown): CacheDiff => {
    if (!oldObj || !newObj) return { full: "Complete data change" };

    const changes: CacheDiff = {};
    const oldKeys = Object.keys(oldObj as object);
    const newKeys = Object.keys(newObj as object);

    // Find changed or added properties
    newKeys.forEach((key) => {
      const oldValue = (oldObj as Record<string, unknown>)[key];
      const newValue = (newObj as Record<string, unknown>)[key];

      if (
        compareFunction(oldValue as TData) !==
        compareFunction(newValue as TData)
      ) {
        changes[key] = {
          old: oldValue,
          new: newValue,
        };
      }
    });

    // Find removed properties
    oldKeys.forEach((key) => {
      if (!newKeys.includes(key)) {
        changes[key] = {
          old: (oldObj as Record<string, unknown>)[key],
          new: undefined,
        };
      }
    });

    return changes;
  };

  const logCache = (
    type: "Query" | "Mutation",
    queryKey: readonly unknown[],
    oldData: unknown,
    newData: unknown,
  ): void => {
    // Extra safety check
    if (!isDevEnvironment()) return;

    const timestamp = new Date().toISOString();
    const diff = compareObjects(oldData, newData);

    console.group(`[Query Cache Update - ${timestamp}]`);
    console[logLevel](`Type: ${type}`);
    console[logLevel](`Query Key: ${JSON.stringify(queryKey)}`);
    console[logLevel]("Changes:", diff);
    console[logLevel](
      "Old Data:",
      ...(Array.isArray(oldData) ? [oldData.length, oldData?.[0]] : [oldData]),
    );
    console[logLevel](
      "New Data:",
      ...(Array.isArray(newData) ? [newData.length, newData?.[0]] : [newData]),
    );
    console.groupEnd();
  };

  useEffect(() => {
    // Extra safety check
    if (!isDevEnvironment()) return;

    const unsubscribe = queryClient
      .getQueryCache()
      .subscribe((event: QueryCacheEvent) => {
        if (!filter(event)) return;

        const { type, query } = event;

        if (type === "updated" && includeQueries) {
          const queryKey = query.queryKey;
          const oldData = previousCache.current.get(JSON.stringify(queryKey));
          const newData = query.state.data as TData;

          // Skip if we have queryKeys filter and this key doesn't match
          if (queryKeys.length > 0 && !isQueryKeyMatch(queryKey, queryKeys)) {
            return;
          }
          if (compareFunction(oldData as TData) !== compareFunction(newData)) {
            logCache("Query", queryKey, oldData, newData);
            previousCache.current.set(
              JSON.stringify(queryKey),
              deepClone(newData),
            );
          }
        }
      });

    if (includeMutations) {
      const mutationUnsubscribe = queryClient
        .getMutationCache()
        .subscribe((event: MutationCacheEvent) => {
          if (!filter(event)) return;

          const { type, mutation } = event;
          if (type === "updated") {
            const mutationKey = mutation.options.mutationKey || [];
            // Skip if we have queryKeys filter and this key doesn't match
            if (
              queryKeys.length > 0 &&
              !isQueryKeyMatch(mutationKey, queryKeys)
            ) {
              return;
            }
            logCache(
              "Mutation",
              mutation.options.mutationKey || [],
              mutation.state.variables,
              mutation.state.data,
            );
          }
        });

      return () => {
        unsubscribe();
        mutationUnsubscribe();
      };
    }

    return unsubscribe;
  }, [
    queryClient,
    logLevel,
    includeMutations,
    includeQueries,
    compareFunction,
    filter,
  ]);
};

export default useQueryCacheLogger;
