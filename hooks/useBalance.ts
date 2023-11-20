import { useAuth } from "./useAuth";
import { NWCResponseGetBalance, getNwcBalance, getSettings } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useBalanceQueryKey } from "./useBalanceQueryKey";

export const useBalance = () => {
  const { pubkey: userPubkey } = useAuth();
  const queryKey = useBalanceQueryKey();
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!userPubkey) return;
      try {
        const { nwcPubkey: walletPubkey, nwcRelay } =
          await getSettings(userPubkey);
        const { result } = (await getNwcBalance({
          userPubkey,
          walletPubkey,
          nwcRelay: "wss://relay.getalby.com/v1",
        })) as NWCResponseGetBalance;
        console.log(result);
        const { balance, budget_renewal, max_amount } = result;
        return balance;
      } catch (e) {
        throw e;
      }
    },
    enabled: Boolean(userPubkey),
    staleTime: Infinity,
  });
};
