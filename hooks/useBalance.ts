import { useAuth } from "./useAuth";
import { getNwcBalance } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useBalanceQueryKey } from "./useBalanceQueryKey";
import { useSettings } from "./useSettings";

export const useBalance = () => {
  const { pubkey: userPubkey } = useAuth();
  const { data: settings } = useSettings();
  const { nwcPubkey: walletPubkey, nwcRelay } = settings || {};
  const enabled = Boolean(userPubkey) && Boolean(settings?.enableNWC);
  const queryKey = useBalanceQueryKey();
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!userPubkey || !walletPubkey || !nwcRelay) return;

      const { result } = await getNwcBalance({
        userPubkey,
        walletPubkey,
        nwcRelay,
      });
      const { balance, budget_renewal, max_amount } = result;
      return balance;
    },
    enabled,
  });
};
