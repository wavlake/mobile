import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useSettings } from "./useSettings";
import { getNwcBalance } from "@/utils";
import { useEffect, useState } from "react";
import { useToast } from "./useToast";

export const useWalletBalance = () => {
  const { data: settings } = useSettings();
  const { enableNWC, nwcPubkey, nwcRelay } = settings ?? {};
  const { pubkey: userPubkey } = useAuth();
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const toast = useToast();

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["balance", userPubkey],
    queryFn: async () => {
      const response = await getNwcBalance({
        userPubkey,
        walletPubkey: nwcPubkey,
        nwcRelay: nwcRelay,
      });
      if (response?.result_type !== "get_balance") {
        toast.show("Something went wrong. Please try again later.");
        return;
      }

      return response?.result?.balance ?? 0;
    },
    enabled: enableNWC,
  });

  useEffect(() => {
    if (data) {
      setBalance(data);
    }
  }, [data]);

  useEffect(() => {
    (async () => {
      if (!userPubkey || !enableNWC || !nwcPubkey || !nwcRelay) {
        return;
      }
      refetch();
    })();
  }, [enableNWC, userPubkey, nwcPubkey, nwcRelay]);

  return { balance: enableNWC ? balance : undefined, setBalance, isLoading };
};
