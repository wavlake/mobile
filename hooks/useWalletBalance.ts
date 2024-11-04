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
      if (!userIdOrPubkey || !nwcPubkey || !nwcRelay) return;

      const response = await getNwcBalance({
        userIdOrPubkey,
        walletPubkey: nwcPubkey,
        nwcRelay: nwcRelay,
      });
      if (response?.result_type !== "get_balance") {
        toast.show("Something went wrong. Please try again later.");
        return undefined;
      }

      if (response.error?.message) {
        toast.show(`NWC: ${response.error.message}`);
      }

      if (typeof response.result?.balance !== "number") {
        throw "Unable to fetch balance";
      }

      return response.result;
    },
    enabled: !!enableNWC && !!userIdOrPubkey && !!nwcPubkey && !!nwcRelay,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const setBalance = (newBalance: number) => {
    queryClient.setQueryData(queryKey, newBalance);
  };

  return {
    ...queryResult,
    setBalance,
  };
};
