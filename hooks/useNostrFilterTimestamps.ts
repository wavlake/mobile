import { Filter } from "nostr-tools";
import { useQueryClient } from "@tanstack/react-query";

// Create a stable key from a filter object
const createFilterKey = (filter: Filter): string => {
  const { kinds, authors, "#p": pTags, "#e": eTags, limit, ...rest } = filter;
  return JSON.stringify({
    kinds: kinds?.sort(),
    authors: authors?.sort(),
    "#p": pTags?.sort(),
    "#e": eTags?.sort(),
    limit,
    ...rest,
  });
};

export const useNostrFilterTimestamps = () => {
  const queryClient = useQueryClient();
  const timestampsKey = ["nostr-filter-timestamps"];

  const getTimestamp = (filter: Filter): number => {
    const timestamps =
      (queryClient.getQueryData(timestampsKey) as Record<string, number>) || {};
    return timestamps[createFilterKey(filter)] || 0;
  };

  const setTimestamp = (filter: Filter) => {
    const timestamps =
      (queryClient.getQueryData(timestampsKey) as Record<string, number>) || {};
    const filterKey = createFilterKey(filter);
    queryClient.setQueryData(timestampsKey, {
      ...timestamps,
      [filterKey]: Math.floor(Date.now() / 1000),
    });
  };

  return {
    getTimestamp,
    setTimestamp,
  };
};
