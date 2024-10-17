import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { HorizontalArtworkRow, SectionHeader } from "@/components";
import { Track } from "@/utils";

export const NewMusicSection = ({ data }: { data: Track[] }) => {
  const { loadTrackList } = useMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: data,
      trackListId: "new-music",
      startIndex: index,
      playerTitle: "New music",
    });
  };

  return (
    <View>
      <SectionHeader title="Out Now" />
      <HorizontalArtworkRow items={data} onPress={handleRowPress} />
    </View>
  );
};
