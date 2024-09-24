import { SectionHeader } from "./SectionHeader";
import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { HorizontalArtworkRow } from "@/components/HorizontalArtworkRow";
import { Track } from "@/utils";

export const ForYouSection = ({ data }: { data: Track[] }) => {
  const { loadTrackList } = useMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: data,
      trackListId: "for-you",
      startIndex: index,
      playerTitle: "For You",
    });
  };

  return (
    <View>
      <SectionHeader title="For You" />
      <HorizontalArtworkRow items={data} onPress={handleRowPress} />
    </View>
  );
};
