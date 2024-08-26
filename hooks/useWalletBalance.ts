import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useSettings } from "./useSettings";
import { getNwcBalance } from "@/utils";
import { useEffect, useState } from "react";

export const useWalletBalance = () => {
  const { data: settings } = useSettings();
  const { enableNWC, nwcPubkey, nwcRelay } = settings ?? {};
  const { pubkey: userPubkey } = useAuth();
  const [balance, setBalance] = useState<number | undefined>(undefined);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["balance", userPubkey],
    queryFn: async () => {
      const response = await getNwcBalance({
        userPubkey,
        walletPubkey: nwcPubkey,
        nwcRelay: nwcRelay,
      });
      return response.result.balance ?? 0;
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
