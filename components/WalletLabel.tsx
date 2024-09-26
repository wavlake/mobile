import { Text } from "@/components";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { View } from "react-native";

export const satsFormatter = (mSats: number) => {
  if (isNaN(mSats)) {
    return "0";
  }

  const sats = Math.floor(mSats / 1000);

  if (sats >= 1000000) {
    return Math.floor(sats / 10000) / 100 + "M";
  } else if (sats >= 1000) {
    return Math.floor(sats / 100) / 10 + "k";
  } else if (sats < 1) {
    return "<1";
  } else {
    return sats.toString();
  }
};

export const msatsToSatsWithCommas = (mSats: number) => {
  const sats = Math.floor(mSats / 1000).toFixed(0);
  // add commas
  return sats.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const satsWithCommas = (sats: number) => {
  const satsString = Math.floor(sats / 1000).toFixed(0);
  // add commas
  return satsString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const WalletLabel: React.FC = () => {
  const { data: balance } = useWalletBalance();
  const userHasABalance = typeof balance === "number";
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 24 }}>Wallet</Text>
      {userHasABalance && (
        <>
          <Text style={{ fontSize: 4 }}>{"\u2B24"}</Text>
          <Text style={{ fontSize: 14 }}>{satsFormatter(balance)} sats</Text>
        </>
      )}
    </View>
  );
};
