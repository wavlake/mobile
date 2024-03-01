import { useLocalSearchParams } from "expo-router";
import { Dimensions, FlatList, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Podcast, getPodcast, getPodcastEpisodes } from "@/utils";
import { Text } from "@/components/Text";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { AlbumOrArtistPageButtons } from "@/components/AlbumOrArtistPageButtons";
import { TrackRow } from "@/components/TrackRow";
import { SectionHeader } from "@/components/SectionHeader";
import { SquareArtwork } from "@/components/SquareArtwork";
import { useGetArtistOrAlbumBasePathname } from "@/hooks/useGetArtistOrAlbumBasePathname";

interface PodcastPageFooterProps {
  podcast: Podcast;
}

const PodcastPageFooter = ({ podcast }: PodcastPageFooterProps) => {
  const { description, name, id: id } = podcast;

  return (
    <View style={{ marginTop: 16, marginBottom: 80, paddingHorizontal: 16 }}>
      {description && (
        <>
          <SectionHeader title="Description" />
          <Text style={{ fontSize: 18 }}>{description}</Text>
        </>
      )}
    </View>
  );
};

export const PodcastPage = () => {
  const { loadTrackList } = useMusicPlayer();
  const { podcastId } = useLocalSearchParams();
  const { data: podcast } = useQuery({
    queryKey: [podcastId],
    queryFn: () => getPodcast(podcastId as string),
  });

  const { data: episodes = [] } = useQuery({
    queryKey: ["podcasts", podcastId],
    queryFn: () => getPodcastEpisodes(podcastId as string),
  });
  const screenWidth = Dimensions.get("window").width;
  const handleRowPress = async (index: number, playerTitle: string) => {
    await loadTrackList({
      trackList: episodes,
      trackListId: podcastId as string,
      startIndex: index,
      playerTitle,
    });
  };

  return (
    <FlatList
      data={episodes}
      ListHeaderComponent={() => {
        if (!podcast) {
          return null;
        }

        const { id, name, artworkUrl } = podcast;

        return (
          <View style={{ marginBottom: 36 }}>
            <SquareArtwork size={screenWidth} url={artworkUrl} />
            <AlbumOrArtistPageButtons
              type="podcast"
              shareUrl={`https://wavlake.com/podcast/${podcastId}`}
              content={podcast}
              trackListId={id}
              trackListTitle={name}
              onPlay={handleRowPress}
            />
          </View>
        );
      }}
      renderItem={({ item, index }) => {
        const { title, artist } = item;
        const isLastItem = index === episodes.length - 1;

        return (
          <View style={{ marginBottom: isLastItem ? 0 : 16 }}>
            <TrackRow
              track={item}
              descriptor={artist}
              onPress={() => handleRowPress(index, title)}
            />
          </View>
        );
      }}
      ListFooterComponent={() =>
        podcast ? <PodcastPageFooter podcast={podcast} /> : null
      }
      keyExtractor={(item) => item.id}
      style={{ paddingTop: 8 }}
    />
  );
};
