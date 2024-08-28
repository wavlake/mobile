import { Button, msatsToSatsWithCommas, Text } from "@/components";
import useBitcoinPrice from "@/hooks/useBitcoinPrice";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  View,
} from "react-native";

export const getDollarAmount = (msats?: number, price?: number | null) => {
  if (!price || !msats) return;
  const sats = Math.floor(msats / 1000);
  const USD = (sats / 100000000) * price;
  return USD.toFixed(2);
};

export default function Wallet({}: {}) {
  const router = useRouter();
  const onSend = async () => {
    router.push("/wallet/scanner");
  };

  const onReceive = async () => {
    router.push("/wallet/receive");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
          gap: 60,
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
          <Button width={160} color="white" onPress={onSend}>
            Send
          </Button>
          <Button width={160} color="white" onPress={onReceive}>
            Receive
          </Button>
        </View>
        {/* <TouchableOpacity
          style={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onPress={() => {
            router.push("/wallet/history");
          }}
        >
          <Text
            style={{
              fontSize: 20,
            }}
          >
            History
          </Text>
        </TouchableOpacity> */}
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
        justifyContent: "flex-end",
        alignItems: "center",
        flexGrow: 1,
      }}
    >
      <View
        style={{
          height: 60,
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
            {balance ? `${msatsToSatsWithCommas(balance)} sats` : ""}
          </Text>
        )}
      </View>
      <View
        style={{
          height: 40,
        }}
      >
        {priceLoading ? (
          <ActivityIndicator animating={true} size="small" />
        ) : (
          <Text
            style={{
              fontSize: 14,
            }}
          >
            {usdValue ? `~$${getDollarAmount(balance, bitcoinPrice)}` : ""}
          </Text>
        )}
      </View>
    </View>
  );
};
