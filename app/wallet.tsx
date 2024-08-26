import { Text, Button } from "@/components";
import useBitcoinPrice from "@/hooks/useBitcoinPrice";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { ActivityIndicator, SafeAreaView, View } from "react-native";

const satsFormatter = (mSats: number) => {
  const sats = Math.floor(mSats / 1000).toFixed(0);
  // add commas
  return sats.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getDollarAmount = (msats?: number, price?: number | null) => {
  if (!price || !msats) return;
  const sats = Math.floor(msats / 1000);
  const USD = (sats / 100000000) * price;
  return USD.toFixed(2);
};

export default function Wallet({}: {}) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          marginVertical: 24,
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <BalanceInfo />
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <Button width={160} color="white" onPress={async () => {}}>
            Send
          </Button>
          <Button width={160} color="white" onPress={async () => {}}>
            Receive
          </Button>
        </View>
        <View
          style={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Text
            style={{
              fontSize: 20,
            }}
          >
            History
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BalanceInfo = () => {
  const { balance, isLoading: balanceLoading } = useWalletBalance();
  const { bitcoinPrice, isLoading: priceLoading } = useBitcoinPrice();
  const usdValue = getDollarAmount(balance, bitcoinPrice);
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        flexGrow: 1,
      }}
    >
      {balanceLoading ? (
        <ActivityIndicator animating={true} size="small" />
      ) : (
        <Text
          style={{
            fontSize: 32,
          }}
        >
          {balance ? `${satsFormatter(balance)} sats` : "error"}
        </Text>
      )}
      {priceLoading ? (
        <ActivityIndicator animating={true} size="small" />
      ) : (
        <Text
          style={{
            fontSize: 14,
          }}
        >
          {usdValue ? `~$${getDollarAmount(balance, bitcoinPrice)}` : "error"}
        </Text>
      )}
    </View>
  );
};
