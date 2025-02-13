import { useQuery } from "@tanstack/react-query";
import { encodeNpub, getFollowsListMap } from "@/utils";
import { useNostrRelayList } from "@/hooks/nostrRelayList";

export const getNostrFollowsQueryKey = (pubkey?: string | null) => [
  "follows",
  pubkey,
];

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
export const useNostrFollows = (pubkey?: string | null) => {
  const { readRelayList } = useNostrRelayList();

  return useQuery({
    queryKey: getNostrFollowsQueryKey(pubkey),
    queryFn: async () => {
      const isValid = pubkey && pubkey.length === 64 && !!encodeNpub(pubkey);

      if (!isValid) {
        return [];
      }
      // TODO - also store this map in the cache
      // Record<followPubkey, followRelay>
      const followsMap = await getFollowsListMap(pubkey, readRelayList);

      return followsMap ? Object.keys(followsMap) : [];
    },
    enabled: Boolean(pubkey),
    staleTime: TWENTY_FOUR_HOURS,
  });
};
