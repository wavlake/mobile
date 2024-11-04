import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { Track } from "@/utils";
import { NewMusicSection } from "./NewMusicSection";
import { useHomePage, useToast } from "@/hooks";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";
import { ForYouSection } from "./ForYouSection";
import { FeaturedSection } from "./FeaturedSection";
import { SectionHeader } from "./SectionHeader";
import { Text } from "./shared/Text";
import { VercelImage } from "./VercelImage";
import { Center } from "./shared/Center";
import { EarnSection } from "./EarnSection";

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
        <VercelImage size={100} url={artworkUrl} />
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
  const toast = useToast();
  const {
    data: homePageData,
    isLoading,
    refetch,
    error,
    isError,
  } = useHomePage();

  isError && toast.show(JSON.stringify(error));
  const {
    featured = [],
    newTracks = [],
    trending = [],
    forYou = [],
  } = homePageData || {};

  if (isLoading) {
    return (
      <Center>
        <ActivityIndicator />
      </Center>
    );
  }

  return (
    <FlatList
      data={trending}
      ListHeaderComponent={
        isLoading
          ? null
          : () => (
              <View>
                <EarnSection />
                <FeaturedSection data={featured} />
                <ForYouSection data={forYou} />
                <NewMusicSection data={newTracks} />
                <SectionHeader title="Trending" />
              </View>
            )
      }
      renderItem={({ item, index }) => (
        <TopMusicRow trackList={trending} track={item} index={index} />
      )}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      keyExtractor={(item) => item.id}
      windowSize={5}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
    />
  );
};
