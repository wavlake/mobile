import { useAuth } from "./useAuth";
import { getNwcBalance, getSettings } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useBalanceQueryKey } from "./useBalanceQueryKey";

export const useBalance = () => {
  const { pubkey: userPubkey } = useAuth();
  const queryKey = useBalanceQueryKey();
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!userPubkey) return;
      const { nwcPubkey: walletPubkey, nwcRelay } =
        await getSettings(userPubkey);
      const { result } = await getNwcBalance({
        userPubkey,
        walletPubkey,
        nwcRelay,
      });
      const { balance, budget_renewal, max_amount } = result;
      return balance;
    },
    enabled: Boolean(userPubkey),
  });
};
