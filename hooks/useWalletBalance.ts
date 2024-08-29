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

  const queryData = useQuery({
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
    if (queryData.data) {
      setBalance(queryData.data);
    }
  }, [queryData.data]);

  useEffect(() => {
    if (!userPubkey || !enableNWC || !nwcPubkey || !nwcRelay) {
      return;
    }
    queryData.refetch();
  }, [enableNWC, userPubkey, nwcPubkey, nwcRelay]);

  return { ...queryData, balance: enableNWC ? balance : undefined, setBalance };
};
