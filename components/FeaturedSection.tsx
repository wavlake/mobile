import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { HorizontalArtworkRowLarge, SectionHeader } from "@/components";
import { Track } from "@/utils";

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
