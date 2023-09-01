import { View, ActivityIndicator, Dimensions } from "react-native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { Center } from "@/components/Center";
import { MarqueeText } from "@/components/MarqueeText";
import { PlayerControls } from "./PlayerControls";
import { ArtworkCarousel } from "./ArtworkCarousel";

export const FullSizeMusicPlayer = () => {
  const { songQueue, currentSongIndex } = useMusicPlayer();
  const currentSong = songQueue[currentSongIndex];
  const { title, artist } = currentSong || {};
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;

  return currentSong ? (
    <View style={{ paddingTop: 8 }}>
      <ArtworkCarousel />
      <View style={{ padding }}>
        <View style={{ maxWidth: screenWidth - padding * 2 }}>
          <MarqueeText style={{ fontSize: 20 }} bold>
            {title}
          </MarqueeText>
          <MarqueeText style={{ fontSize: 18 }}>{artist}</MarqueeText>
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
