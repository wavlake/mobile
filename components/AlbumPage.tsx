import { useLocalSearchParams } from "expo-router";
import { Dimensions, FlatList, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getAlbum, getAlbumTracks } from "@/utils";
import { Text } from "@/components/Text";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { AlbumOrArtistPageButtons } from "@/components/AlbumOrArtistPageButtons";
import { TrackRow } from "@/components/TrackRow";
import { SectionHeader } from "@/components/SectionHeader";
import { SquareArtwork } from "@/components/SquareArtwork";

interface AlbumPageFooterProps {
  description: string;
}

const AlbumPageFooter = ({ description }: AlbumPageFooterProps) => {
  return (
    <View style={{ marginTop: 16, marginBottom: 80, paddingHorizontal: 16 }}>
      <SectionHeader title="About" />
      <Text style={{ fontSize: 18 }}>{description}</Text>
    </View>
  );
};

export const AlbumPage = () => {
  const { loadTrackList } = useMusicPlayer();
  const { albumId } = useLocalSearchParams();
  const { data: album } = useQuery({
    queryKey: [albumId],
    queryFn: () => getAlbum(albumId as string),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => getAlbumTracks(albumId as string),
  });
  const screenWidth = Dimensions.get("window").width;
  const handleRowPress = async (index: number, playerTitle: string) => {
    await loadTrackList({
      trackList: tracks,
      trackListId: albumId as string,
      startIndex: index,
      playerTitle,
    });
  };

  return (
    <FlatList
      data={tracks}
      ListHeaderComponent={() => {
        if (!album) {
          return null;
        }

        const { id, title, artworkUrl } = album;

        return (
          <View style={{ marginBottom: 36 }}>
            <SquareArtwork size={screenWidth} url={artworkUrl} />
            <AlbumOrArtistPageButtons
              type="album"
              shareUrl={`https://wavlake.com/album/${albumId}`}
              content={album}
              trackListId={id}
              trackListTitle={title}
              onPlay={handleRowPress}
            />
          </View>
        );
      }}
      renderItem={({ item, index }) => {
        const { albumTitle, artist } = item;
        const isLastItem = index === tracks.length - 1;

        return (
          <View style={{ marginBottom: isLastItem ? 0 : 16 }}>
            <TrackRow
              track={item}
              descriptor={artist}
              onPress={() => handleRowPress(index, albumTitle)}
            />
          </View>
        );
      }}
      ListFooterComponent={() =>
        album?.description ? (
          <AlbumPageFooter description={album?.description} />
        ) : null
      }
      keyExtractor={(item) => item.id}
      style={{ paddingTop: 8 }}
    />
  );
};
