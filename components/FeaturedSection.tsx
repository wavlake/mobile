import { SectionHeader } from "./SectionHeader";
import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { useNewMusic } from "@/hooks";
import { HorizontalArtworkRow } from "@/components/HorizontalArtworkRow";

export const FeaturedSection = () => {
  const { data = [] } = useNewMusic();
  const { loadTrackList } = useMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: data,
      trackListId: "featured",
      startIndex: index,
      playerTitle: "Featured",
    });
  };

  return (
    <View>
      <SectionHeader title="Featured" />
      <HorizontalArtworkRow items={data} onPress={handleRowPress} />
    </View>
  );
};
