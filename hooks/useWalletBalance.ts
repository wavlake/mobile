import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { useSettings } from "@/hooks/useSettings";
import { getNwcBalance } from "@/utils";
import { useEffect } from "react";

export const useWalletBalance = () => {
  const { data: settings } = useSettings();
  const { enableNWC, nwcPubkey, nwcRelay } = settings ?? {};
  const { pubkey: userPubkey } = useAuth();

  const { data, refetch } = useQuery({
    queryKey: ["balance", userPubkey],
    queryFn: async () => {
      const response = await getNwcBalance({
        userPubkey,
        walletPubkey: nwcPubkey,
        nwcRelay: nwcRelay,
      });
      return response.result.balance;
    },
    enabled: false,
    retry: (failureCount, error) => failureCount < 4,
  });

  useEffect(() => {
    (async () => {
      if (!userPubkey || !enableNWC || !nwcPubkey || !nwcRelay) {
        return;
      }
      refetch();
    })();
  }, [enableNWC, userPubkey, nwcPubkey, nwcRelay]);
  return { balance: enableNWC ? data : undefined };
};
