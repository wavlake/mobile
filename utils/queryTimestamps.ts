import { QueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";

const TIMESTAMP_PREFIX = ["nostr", "timestamps"];

const getTimestampQueryKey = (queryKey: string[]) => [
  ...TIMESTAMP_PREFIX,
  ...queryKey,
];

export const getQueryTimestamp = (
  queryClient: QueryClient,
  queryKey: string[],
): number => {
  const timestampKey = getTimestampQueryKey(queryKey);
  return queryClient.getQueryData<number>(timestampKey) ?? 0;
};

export const updateQueryTimestamp = (
  queryClient: QueryClient,
  queryKey: string[],
  events: Event | Event[],
) => {
  const eventsArray = Array.isArray(events) ? events : [events];
  if (eventsArray.length === 0) return;

  const timestampKey = getTimestampQueryKey(queryKey);
  const currentTimestamp = getQueryTimestamp(queryClient, queryKey);

  // Find the oldest timestamp in the new events
  const oldestTimestamp = Math.min(...eventsArray.map((e) => e.created_at));

  // Update if this is older than what we have
  if (oldestTimestamp < currentTimestamp || currentTimestamp === 0) {
    queryClient.setQueryData(timestampKey, oldestTimestamp);
  }
};
