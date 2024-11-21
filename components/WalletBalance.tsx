import React, { useState } from "react";
import {
  Text,
  TextProps,
  Pressable,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { DollarAmount } from "./DollarAmount";

interface AmountProps extends TextProps {
  style?: any;
}

const MSATS_PER_SAT = 1000;

const Balance: React.FC<AmountProps> = ({ style, ...textProps }) => {
  const [showSats, setShowSats] = useState(false);
  const { data: nwcBalance, isLoading } = useWalletBalance();

  // Handle loading state
  if (isLoading) {
    return (
      <View style={[styles.loading]}>
        <ActivityIndicator animating={true} size="small" />
      </View>
    );
  }

  if (
    nwcBalance === null ||
    nwcBalance === undefined ||
    !Number.isFinite(nwcBalance?.balance)
  ) {
    return;
  }

  const sats = nwcBalance.balance / MSATS_PER_SAT;

  const formattedSats = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(sats);

  return (
    <Pressable
      onPress={() => setShowSats(!showSats)}
      style={[styles.wrapper, style]}
    >
      <Text numberOfLines={1} style={styles.text}>
        Wallet Balance
      </Text>
      {showSats ? (
        <Text style={styles.text} {...textProps}>
          {formattedSats} sats
        </Text>
      ) : (
        <DollarAmount sats={sats} style={styles.text} {...textProps} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    gap: 3,
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  loading: {
    color: "white",
    width: 70,
    textAlign: "center",
  },
});

export const WalletBalance = React.memo(Balance);
