import { Text } from "@/components/Text";
import { useWalletBalance } from "@/hooks/useWalletBalance";

const satsFormatter = (mSats: number) => {
  const sats = (mSats / 1000).toFixed(0);
  // add commas
  return sats.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const WalletBalance: React.FC = () => {
  const { balance } = useWalletBalance();

  if (!balance) {
    return null;
  }

  return (
    <Text style={{ marginHorizontal: 16, marginBottom: 8 }}>
      Wallet Balance: {satsFormatter(balance)} sats
    </Text>
  );
};
