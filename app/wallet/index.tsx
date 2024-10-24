import {
  Button,
  msatsToSatsWithCommas,
  Text,
  DollarAmount,
} from "@/components";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  View,
} from "react-native";

export default function Wallet({}: {}) {
  const router = useRouter();
  const onSend = async () => {
    router.push("/wallet/withdraw");
  };

  const onReceive = async () => {
    router.push("/wallet/fund");
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
            Withdraw
          </Button>
          <Button width={160} color="white" onPress={onReceive}>
            Fund
          </Button>
        </View>
        <TouchableOpacity
          style={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onPress={() => {
            router.push({
              pathname: "/wallet/history",
            });
          }}
        >
          <Text
            style={{
              fontSize: 20,
            }}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const BalanceInfo = () => {
  const { data: balance, isLoading: balanceLoading } = useWalletBalance();

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
            {typeof balance === "number"
              ? `${msatsToSatsWithCommas(balance)} sats`
              : "-"}
          </Text>
        )}
      </View>
      <View
        style={{
          height: 40,
        }}
      >
        <DollarAmount sats={balance ? balance / 1000 : 0} />
      </View>
    </View>
  );
};
