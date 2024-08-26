import { Text } from "@/components/Text";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { View } from "react-native";

export const satsFormatter = (mSats: number) => {
  const sats = Math.floor(mSats / 1000);

  if (sats >= 1000000) {
    return (sats / 1000000).toFixed(2) + "M";
  } else if (sats >= 1000) {
    return (sats / 1000).toFixed(1) + "k";
  } else {
    return sats.toString();
  }
};

export const WalletLabel: React.FC = () => {
  const { balance } = useWalletBalance();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 18 }}>Wallet</Text>
      {balance && (
        <>
          <Text style={{ fontSize: 4 }}>{"\u2B24"}</Text>
          <Text style={{ fontSize: 18 }}>{satsFormatter(balance)} sats</Text>
        </>
      )}
    </View>
  );
};
