import { Dimensions, View } from "react-native";
import { SquareArtwork } from "@/components/SquareArtwork";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { VercelImage } from "../VercelImage";

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
        <VercelImage
          size={screenWidth - padding * 2}
          url={artworkUrl}
          quality={100}
        />
      )}
    </View>
  );
};
