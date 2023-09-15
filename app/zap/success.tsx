import { Button, LogoIcon, MarqueeText, SongArtwork, Text } from "@/components";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, View } from "react-native";
import { brandColors } from "@/constants";
import { useTheme } from "@react-navigation/native";

export default function ZapSuccess() {
  const router = useRouter();
  const { colors } = useTheme();
  const { zapAmount, title, artist, artworkUrl } = useLocalSearchParams<{
    zapAmount: string;
    title: string;
    artist: string;
    artworkUrl: string;
  }>();
  const fontColor = brandColors.black.DEFAULT;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: brandColors.pink.DEFAULT,
        }}
      >
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
            <LogoIcon fill={brandColors.black.DEFAULT} width={74} height={62} />
            <Text
              style={{ color: fontColor, fontSize: 18, marginTop: 16 }}
              bold
            >
              {`Zapped ${zapAmount} sats 🎉`}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            {artworkUrl && <SongArtwork size={248} url={artworkUrl} />}
            <MarqueeText
              style={{ color: fontColor, fontSize: 20, marginTop: 16 }}
              bold
            >
              {title}
            </MarqueeText>
            <MarqueeText style={{ color: fontColor, fontSize: 18 }}>
              by {artist}
            </MarqueeText>
          </View>
          <Button
            color={brandColors.black.DEFAULT}
            titleStyle={{ color: colors.text }}
            onPress={() => router.back()}
          >
            OK
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
}
