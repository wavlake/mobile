import { useQuery } from "@tanstack/react-query";
import { getPubkeyActivity } from "@/utils";

// get the activity feed for a given pubkey
export const usePubkeyActivity = (pubkey: string | null) => {
  return useQuery({
    queryKey: ["pubkeyActivityPreview", pubkey],
    queryFn: () => getPubkeyActivity(pubkey, 1, 3),
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
