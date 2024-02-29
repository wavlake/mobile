import { FlatList, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getTopShows, Track } from "@/utils";
import { BadgeIcon } from "@/components/BadgeIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { Text } from "@/components/Text";
import { SquareArtwork } from "@/components/SquareArtwork";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";

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
  const { title } = episode;
  const { loadTrackList } = useMusicPlayer();
  const { height } = useMiniMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: episodeList,
      trackListId: "trending",
      startIndex: index,
      playerTitle: "Trending",
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
          {/* <Text>{artist}</Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const HomePageShows = () => {
  const { data = [] } = useQuery({
    queryKey: ["topShows"],
    queryFn: getTopShows,
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
