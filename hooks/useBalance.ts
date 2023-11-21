import { useAuth } from "./useAuth";
import { getNwcBalance } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useBalanceQueryKey } from "./useBalanceQueryKey";
import { useSettings } from "./useSettings";

export const useBalance = () => {
  const { pubkey: userPubkey } = useAuth();
  const { data: settings } = useSettings();
  const enabled = Boolean(userPubkey);
  const queryKey = useBalanceQueryKey();
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!userPubkey || !settings) return;

      const response = await getNwcBalance({
        userPubkey,
        walletPubkey: settings.nwcPubkey,
        nwcRelay: settings.nwcRelay,
      });

      // can't return undefined, so return -1
      if (!response) return -1;

      const { balance, budget_renewal, max_amount } = response.result;
      return balance;
    },
    enabled,
  });
};
