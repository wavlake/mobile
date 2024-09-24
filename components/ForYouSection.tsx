import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { HorizontalArtworkRow, SectionHeader } from "@/components";
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
