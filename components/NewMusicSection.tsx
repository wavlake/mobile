import { NewBadgeIcon } from "./NewBadgeIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "./SectionHeader";
import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { useNewMusic } from "@/hooks";
import { HorizontalArtworkRow } from "@/components/HorizontalArtworkRow";

export const NewMusicSection = () => {
  const { data = [] } = useNewMusic();
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
      <SectionHeader
        title="Out Now"
        icon={
          <NewBadgeIcon
            fill={brandColors.pink.DEFAULT}
            width={24}
            height={24}
          />
        }
        rightNavText="Discover"
        rightNavHref={{
          pathname: "/music/discover",
          params: { headerTitle: "New music", includeBackButton: "true" },
        }}
      />
      <HorizontalArtworkRow items={data} onPress={handleRowPress} />
    </View>
  );
};
