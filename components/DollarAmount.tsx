import React, { useMemo } from "react";
import { ActivityIndicator, Text, TextProps, View } from "react-native";
import { useBitcoinPrice } from "./BitcoinPriceProvider";

interface AmountProps extends TextProps {
  sats: number;
}

const SATS_PER_BTC = 100000000;

const Amount: React.FC<AmountProps> = ({ sats, style, ...textProps }) => {
  const { bitcoinPrice, isLoading, error } = useBitcoinPrice();

  const { usdAmount, btcAmount } = useMemo(() => {
    const btc = sats / SATS_PER_BTC;
    const usd = bitcoinPrice ? btc * bitcoinPrice : 0;

    return {
      btcAmount: btc,
      usdAmount: usd,
    };
  }, [sats, bitcoinPrice]);

  const baseStyle = {
    fontSize: 18,
    color: "white",
    width: 70,
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
  if (error || !Number.isFinite(sats)) {
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
      {formattedUSD}
    </Text>
  );
};

export const DollarAmount = React.memo(Amount);
