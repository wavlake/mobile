import { Button, MarqueeText, SquareArtwork, Text } from "@/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, View } from "react-native";
import LottieView from "lottie-react-native";
import { useRef } from "react";

export default function Success() {
  const animation = useRef(null);
  const router = useRouter();
  const { transactionType, amount } = useLocalSearchParams<{
    transactionType: string;
    amount: string;
  }>();

  const amountInt = amount ? parseInt(amount) : undefined;
  const amountFormatted = amountInt ? `${amountInt.toLocaleString()} sats` : "";
  const message = `You ${transactionType} ${
    amountInt ? amountFormatted : "sats"
  }  🎉`;
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
          <LottieView
            autoPlay
            ref={animation}
            style={{ width: 74, height: 62 }}
            source={require("@/assets/boost.json")}
          />
        </View>
        <Text style={{ fontSize: 18, marginTop: 16 }} bold>
          {message}
        </Text>
        <Button onPress={() => router.back()}>OK</Button>
      </View>
    </SafeAreaView>
  );
}
