import React, { useMemo } from "react";
import { ActivityIndicator, Text, TextProps, View } from "react-native";
import { useBitcoinPrice } from "./BitcoinPriceProvider";

interface AmountProps extends TextProps {
  sats: number;
}

const Amount: React.FC<AmountProps> = ({ sats, style, ...textProps }) => {
  const { isLoading, error, convertSatsToUSD } = useBitcoinPrice();
  const usdAmount = convertSatsToUSD(sats);

  const baseStyle = {
    fontSize: 18,
    color: "white",
    width: 70,
    textAlign: "center" as const,
  };

  // Handle loading state
  if (isLoading) {
    return (
      <View style={[baseStyle]}>
        <ActivityIndicator animating={true} size="small" />;
      </View>
    );
  }

  // Handle error state
  if (
    error ||
    !Number.isFinite(sats) ||
    !Number.isFinite(usdAmount) ||
    usdAmount === null
  ) {
    return (
      <Text style={[baseStyle, { opacity: 0.7 }, style]} {...textProps}>
        --
      </Text>
    );
  }

  // Format the USD amount with proper number formatting
  const formattedUSD = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdAmount);

  return (
    <Text style={[baseStyle, style]} {...textProps}>
      ~{formattedUSD}
    </Text>
  );
};

export const DollarAmount = React.memo(Amount);
