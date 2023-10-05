import { Button, MarqueeText, SquareArtwork, Text } from "@/components";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, View } from "react-native";
import LottieView from "lottie-react-native";
import { useRef } from "react";

export default function ZapSuccess() {
  const animation = useRef(null);
  const router = useRouter();
  const { zapAmount, title, artist, artworkUrl } = useLocalSearchParams<{
    zapAmount: string;
    title: string;
    artist: string;
    artworkUrl: string;
  }>();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
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
            <Text style={{ fontSize: 18, marginTop: 16 }} bold>
              {`Zapped ${zapAmount} sats 🎉`}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            {artworkUrl && <SquareArtwork size={248} url={artworkUrl} />}
            <MarqueeText style={{ fontSize: 20, marginTop: 16 }} bold>
              {title}
            </MarqueeText>
            <MarqueeText style={{ fontSize: 18 }}>by {artist}</MarqueeText>
          </View>
          <Button onPress={() => router.back()}>OK</Button>
        </View>
      </SafeAreaView>
    </>
  );
}
