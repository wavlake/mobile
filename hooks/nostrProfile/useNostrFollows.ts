import { useQuery } from "@tanstack/react-query";
import {
  getInitialLoadQueryKey,
  useInitialNostrLoad,
} from "../useInitialNostrLoad";

export const useNostrFollows = (pubkey?: string | null) => {
  // const { data: initialLoad } = useInitialNostrLoad(pubkey);
  const initialLoad = {
    follows: [],
  };
  return useQuery({
    queryKey: ["follows", pubkey],
    queryFn: () => initialLoad?.follows || [],
    enabled: Boolean(pubkey),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};
