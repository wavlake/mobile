import { useQuery, useQueryClient } from "@tanstack/react-query";
import { batchGetProfileMetadata } from "@/utils";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";
import { useMemo } from "react";
import { useInitialNostrLoad } from "../useInitialNostrLoad";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const useCacheFollows = (pubkey?: string) => {
  const queryClient = useQueryClient();
  // const { data: initialLoad } = useInitialNostrLoad(pubkey);
  const initialLoad = {
    follows: [],
  };
  const follows = initialLoad?.follows || [];

  return useQuery({
    queryKey: ["cacheFollows", pubkey],
    queryFn: async () => {
      if (!follows.length) return;

      const events = await batchGetProfileMetadata(
        follows,
        [], // We'll use default relays since relay info is no longer available
      );

      events.forEach((event) => {
        queryClient.setQueryData(useNostrProfileQueryKey(event.pubkey), event);
      });

      return events;
    },
    enabled: Boolean(follows.length),
    staleTime: TWENTY_FOUR_HOURS,
  });
};
