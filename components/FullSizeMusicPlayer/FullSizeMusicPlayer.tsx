import {
  View,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { Center } from "@/components/Center";
import { MarqueeText } from "@/components/MarqueeText";
import { PlayerControls } from "./PlayerControls";
import { ArtworkCarousel } from "./ArtworkCarousel";
import { useRouter } from "expo-router";
import { ZapIcon } from "@/components/ZapIcon";
import { brandColors } from "@/constants";
import { getDefaultZapAmount } from "@/utils";
import { useAuth } from "@/hooks";

export const FullSizeMusicPlayer = () => {
  const router = useRouter();
  const { currentSong } = useMusicPlayer();
  const { title, artist, artworkUrl } = currentSong ?? {
    title: "",
    artist: "",
    artworkUrl: "",
  };
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;
  const { pubkey } = useAuth();

  return currentSong ? (
    <View style={{ paddingTop: 8 }}>
      <ArtworkCarousel />
      <View style={{ padding }}>
        <View
          style={{
            flexDirection: "row",
            maxWidth: screenWidth - padding * 2,
          }}
        >
          <View style={{ flex: 1 }}>
            <MarqueeText style={{ fontSize: 20 }} bold>
              {title}
            </MarqueeText>
            <MarqueeText style={{ fontSize: 18 }}>{artist}</MarqueeText>
          </View>
          <TouchableOpacity
            onPress={async () => {
              const defaultZapAmount =
                (await getDefaultZapAmount(pubkey)) ?? "";

              router.push({
                pathname: "/zap",
                params: { defaultZapAmount, title, artist, artworkUrl },
              });
            }}
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 8,
            }}
          >
            <ZapIcon fill={brandColors.pink.DEFAULT} width={40} height={40} />
          </TouchableOpacity>
        </View>
        <PlayerControls />
      </View>
    </View>
  ) : (
    <Center>
      <ActivityIndicator />
    </Center>
  );
};
