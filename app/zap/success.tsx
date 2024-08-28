import { Button, Text } from "@/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, View } from "react-native";

export default function ZapSuccess() {
  const router = useRouter();
  const { amount, transactionType } = useLocalSearchParams<{
    amount: string;
    transactionType: string;
  }>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          gap: 24,
          justifyContent: "space-between",
          alignItems: "center",
          flex: 1,
          paddingVertical: 60,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 18, marginTop: 16 }} bold>
            You have successfully {transactionType}ed
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 18 }}>center text {amount} sats</Text>
        </View>
        <Button onPress={() => router.back()}>OK</Button>
      </View>
    </SafeAreaView>
  );
}
