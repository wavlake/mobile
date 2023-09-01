import { View, ActivityIndicator, Dimensions } from "react-native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { Center } from "@/components/Center";
import { MarqueeText } from "@/components/MarqueeText";
import { useRef } from "react";
import { PlayerControls } from "./PlayerControls";
import { ArtworkCarousel, ArtworkCarouselRef } from "./ArtworkCarousel";

export const FullSizeMusicPlayer = () => {
  const artworkUrlListRef = useRef<ArtworkCarouselRef>(null);
  const { songQueue, currentSongIndex } = useMusicPlayer();
  const currentSong = songQueue[currentSongIndex];
  const { title, artist } = currentSong || {};
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;

  return currentSong ? (
    <View style={{ paddingTop: 8 }}>
      <ArtworkCarousel ref={artworkUrlListRef} />
      <View style={{ padding }}>
        <View style={{ maxWidth: screenWidth - padding * 2 }}>
          <MarqueeText style={{ fontSize: 20 }} bold>
            {title}
          </MarqueeText>
          <MarqueeText style={{ fontSize: 18 }}>{artist}</MarqueeText>
        </View>
        <PlayerControls
          onBackPress={artworkUrlListRef.current?.back}
          onForwardPress={artworkUrlListRef.current?.next}
        />
      </View>
    </View>
  ) : (
    <Center>
      <ActivityIndicator />
    </Center>
  );
};
