import { SectionHeader } from "./SectionHeader";
import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { HorizontalArtworkRow } from "@/components/HorizontalArtworkRow";
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
      <HorizontalArtworkRow items={data} onPress={handleRowPress} />
    </View>
  );
};
