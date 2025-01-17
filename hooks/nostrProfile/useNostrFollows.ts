import { useQuery } from "@tanstack/react-query";
import { encodeNpub, getFollowsList } from "@/utils";
import { useNostrRelayList } from "@/hooks/nostrRelayList";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
export const useNostrFollows = (pubkey?: string | null) => {
  const { readRelayList } = useNostrRelayList();

  return useQuery({
    queryKey: ["follows", pubkey],
    queryFn: async () => {
      const isValid = pubkey && pubkey.length === 64 && !!encodeNpub(pubkey);

      if (!isValid) {
        return null;
      }

      return getFollowsList(pubkey, readRelayList);
    },
    enabled: Boolean(pubkey),
    staleTime: TWENTY_FOUR_HOURS,
  });
};
