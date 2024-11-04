import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { Track } from "@/utils";
import { SectionHeader } from "./SectionHeader";
import { HorizontalArtworkRowLarge } from "./HorizontalArtworkRowLarge";

export const FeaturedSection = ({ data }: { data: Track[] }) => {
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
      <HorizontalArtworkRowLarge items={data} onPress={handleRowPress} />
    </View>
  );
};
