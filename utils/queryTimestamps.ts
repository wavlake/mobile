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

  const validTimestamps = eventsArray
    .map((e) => e.created_at)
    .filter(
      (timestamp): timestamp is number =>
        typeof timestamp === "number" && !isNaN(timestamp),
    );

  if (validTimestamps.length === 0) return;

  const mostRecentTimestamp = Math.max(...validTimestamps);

  if (mostRecentTimestamp > currentTimestamp) {
    queryClient.setQueryData(timestampKey, mostRecentTimestamp);
  }
};
