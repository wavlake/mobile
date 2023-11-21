import { Text } from "@/components/Text";
import { useAuth } from "@/hooks";
import { useSettings } from "@/hooks/useSettings";
import { getNwcBalance } from "@/utils";
import { useEffect, useState } from "react";

const satsFormatter = (mSats: number) => {
  const sats = (mSats / 1000).toFixed(0);
  // add commas
  return sats.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const WalletBalance: React.FC = () => {
  const [balance, setBalance] = useState<number | undefined>(undefined);
  const { data: settings } = useSettings();
  const { enableNWC, nwcPubkey, nwcRelay } = settings ?? {};
  const { pubkey: userPubkey } = useAuth();
  useEffect(() => {
    (async () => {
      if (!userPubkey || !enableNWC || !nwcPubkey || !nwcRelay) {
        setBalance(undefined);
        return;
      }
      const response = await getNwcBalance({
        userPubkey,
        walletPubkey: nwcPubkey,
        nwcRelay: nwcRelay,
      });

      setBalance(response.result.balance);
    })();
  }, [enableNWC, userPubkey, nwcPubkey, nwcRelay]);

  if (!balance) {
    return null;
  }

  return (
    <Text style={{ marginHorizontal: 16, marginBottom: 8 }}>
      Wallet Balance: {satsFormatter(balance)} sats
    </Text>
  );
};
