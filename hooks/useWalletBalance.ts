import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useSettings } from "./useSettings";
import { getNwcBalance } from "@/utils";
import { useToast } from "./useToast";
import { useUser } from "@/components";

export const useWalletBalance = () => {
  const { data: settings } = useSettings();
  const { enableNWC, nwcPubkey, nwcRelay } = settings ?? {};
  const { pubkey: userPubkey } = useAuth();
  const { catalogUser } = useUser();
  const userIdOrPubkey = catalogUser?.id ?? userPubkey;
  const toast = useToast();
  const queryClient = useQueryClient();

  const queryKey = ["balance", userIdOrPubkey, nwcPubkey, nwcRelay];

  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getNwcBalance({
        userIdOrPubkey,
        walletPubkey: nwcPubkey,
        nwcRelay: nwcRelay,
      });
      if (response?.result_type !== "get_balance") {
        toast.show("Something went wrong. Please try again later.");
        return undefined;
      }

      return response?.result?.balance ?? 0;
    },
    enabled: !!enableNWC && !!userIdOrPubkey && !!nwcPubkey && !!nwcRelay,
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
