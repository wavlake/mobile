import { encodeNpub, getFollowsListMap } from "@/utils";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrQuery } from "../useNostrQuery";
import { nostrQueryKeys } from "@/providers";

export const useNostrFollows = (pubkey?: string | null) => {
  const { readRelayList } = useNostrRelayList();

  return useNostrQuery({
    queryKey: nostrQueryKeys.follows(pubkey),
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
    refetchOnMount: "always",
  });
};
