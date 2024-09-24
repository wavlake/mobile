import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { Track } from "@/utils";
import { NewMusicSection } from "@/components/NewMusicSection";
import { FireIcon } from "@/components/FireIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { Text } from "@/components/Text";
import { SquareArtwork } from "@/components/SquareArtwork";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";
import { ForYouSection } from "./ForYouSection";
import { ListenToEarnSection } from "./ListenToEarnSection";
import { FeaturedSection } from "./FeaturedSection";
import { useHomePage } from "@/hooks";

interface TopMusicRowProps {
  trackList: Track[];
  track: Track;
  index: number;
}

const TopMusicRow = ({ trackList, track, index }: TopMusicRowProps) => {
  const { artworkUrl, title, artist } = track;
  const { loadTrackList } = useMusicPlayer();
  const { height } = useMiniMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: trackList,
      trackListId: "trending",
      startIndex: index,
      playerTitle: "Trending",
    });
  };
  const isLastRow = index === trackList.length - 1;
  const marginBottom = isLastRow ? height + 16 : 16;

  return (
    <TouchableOpacity onPress={() => handleRowPress(index)}>
      <View
        style={{
          flexDirection: "row",
          marginBottom,
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 36,
            width: 48,
            marginRight: 8,
            textAlign: "center",
            alignSelf: "center",
          }}
          bold
        >
          {index + 1}
        </Text>
        <SquareArtwork size={100} url={artworkUrl} />
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

export const HomePageMusic = () => {
  const { data: homePageData, isLoading } = useHomePage();
  const {
    featured = [],
    newMusic = [],
    trending = [],
    forYou = [],
  } = homePageData || {};

  return (
    <FlatList
      data={trending}
      ListHeaderComponent={
        isLoading
          ? null
          : () => (
              <View>
                <ListenToEarnSection />
                <FeaturedSection data={featured} />
                <ForYouSection data={forYou} />
                <NewMusicSection data={newMusic} />
                <SectionHeader
                  title="Trending"
                  icon={
                    <FireIcon
                      fill={brandColors.orange.DEFAULT}
                      width={30}
                      height={30}
                    />
                  }
                />
              </View>
            )
      }
      renderItem={({ item, index }) => (
        <TopMusicRow trackList={trending} track={item} index={index} />
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
