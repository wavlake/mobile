import { useAuth } from "./useAuth";
import { getNwcBalance, getSettings } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useBalanceQueryKey } from "./useBalanceQueryKey";

export const useBalance = () => {
  const { pubkey: userPubkey } = useAuth();
  const queryKey = useBalanceQueryKey();
  const { data: balance, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userPubkey) return;

      const { nwcPubkey: walletPubkey, nwcRelay } =
        await getSettings(userPubkey);
      const balance = await getNwcBalance({
        userPubkey,
        walletPubkey,
        nwcRelay,
      });
      return balance.result.balance;
    },
    enabled: Boolean(userPubkey),
    staleTime: Infinity,
  });
  return { balance, isLoading };
};
