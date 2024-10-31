import { Dimensions, View } from "react-native";
import { SquareArtwork } from "../SquareArtwork";
import { useMusicPlayer } from "../MusicPlayerProvider";

export const ArtworkCarousel = () => {
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;
  const { activeTrack } = useMusicPlayer();
  const { artworkUrl } = activeTrack || {};

  return (
    <View
      style={{
        alignItems: "center",
        width: screenWidth,
      }}
    >
      {artworkUrl && (
        <SquareArtwork size={screenWidth - padding * 2} url={artworkUrl} />
      )}
    </View>
  );
};
