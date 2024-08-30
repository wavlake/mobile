import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useSettings } from "./useSettings";
import { getNwcBalance } from "@/utils";
import { useToast } from "./useToast";

export const useWalletBalance = () => {
  const { data: settings } = useSettings();
  const { enableNWC, nwcPubkey, nwcRelay } = settings ?? {};
  const { pubkey: userPubkey } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const queryKey = ["balance", userPubkey, nwcPubkey, nwcRelay];

  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      console.log("fetching balance");
      const response = await getNwcBalance({
        userPubkey,
        walletPubkey: nwcPubkey,
        nwcRelay: nwcRelay,
      });
      if (response?.result_type !== "get_balance") {
        toast.show("Something went wrong. Please try again later.");
        return undefined;
      }

      return response?.result?.balance ?? 0;
    },
    enabled: !!enableNWC && !!userPubkey && !!nwcPubkey && !!nwcRelay,
    staleTime: 30 * 1000,
  });

  const setBalance = (newBalance: number) => {
    queryClient.setQueryData(queryKey, newBalance);
  };

  return {
    ...queryResult,
    setBalance,
  };
};
