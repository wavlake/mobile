import { FlatList, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getNewPodcasts, Track } from "@/utils";
import { BadgeIcon } from "./icons/";
import { brandColors } from "@/constants";
import { SectionHeader } from "./SectionHeader";
import { Text } from "./shared/Text";
import { SquareArtwork } from "./SquareArtwork";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";

interface FeaturedShowRowProps {
  episodeList: Track[];
  episode: Track;
  index: number;
}

const FeaturedShowRow = ({
  episodeList,
  episode,
  index,
}: FeaturedShowRowProps) => {
  const { title, artist } = episode;
  const { loadTrackList } = useMusicPlayer();
  const { height } = useMiniMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: episodeList,
      trackListId: "featured",
      startIndex: index,
      playerTitle: "Featured",
    });
  };
  const isLastRow = index === episodeList.length - 1;
  const marginBottom = isLastRow ? height + 16 : 16;

  return (
    <TouchableOpacity onPress={() => handleRowPress(index)}>
      <View
        style={{
          flexDirection: "row",
          marginBottom,
        }}
      >
        <SquareArtwork size={100} url={episode.artworkUrl} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ fontSize: 18 }} numberOfLines={2} bold>
            {title}
          </Text>
          <Text>{artist}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const HomePagePodcasts = () => {
  const { data = [] } = useQuery({
    queryKey: ["featuredPodcasts"],
    queryFn: getNewPodcasts,
  });

  return (
    <FlatList
      data={data}
      ListHeaderComponent={() => (
        <View>
          <SectionHeader
            title="Featured"
            icon={
              <BadgeIcon
                fill={brandColors.pink.DEFAULT}
                width={24}
                height={24}
              />
            }
          />
        </View>
      )}
      renderItem={({ item, index }) => (
        <FeaturedShowRow episodeList={data} episode={item} index={index} />
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
