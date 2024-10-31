import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { Track } from "@/utils";
import { HorizontalArtworkRow } from "./HorizontalArtworkRow";
import { SectionHeader } from "./SectionHeader";

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
