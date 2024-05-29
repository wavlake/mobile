import { useQuery } from "@tanstack/react-query";
import { getPubkeyActivity } from "@/utils";
import { usePubkeyActivityQueryKey } from "./usePubkeyActivityQueryKey";

// get the activity feed for a given pubkey
export const usePubkeyActivity = (pubkey?: string | null) => {
  const queryKey = usePubkeyActivityQueryKey(pubkey);

  return useQuery({
    queryKey,
    queryFn: () => getPubkeyActivity(pubkey),
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
