import { useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  formatTrackListForMusicPlayer,
  getAlbum,
  getAlbumTracks,
} from "@/utils";
import { Text } from "@/components/Text";
import {
  LoadTrackList,
  useMusicPlayer,
} from "@/components/MusicPlayerProvider";
import { memo } from "react";
import { AlbumOrArtistPageHeader } from "@/components/AlbumOrArtistPageHeader";
import { TrackRow } from "@/components/TrackRow";
import { SectionHeader } from "@/components/SectionHeader";

const AlbumPageFooter = () => {
  const { albumId } = useLocalSearchParams();
  const { data } = useQuery({
    queryKey: [albumId],
    queryFn: () => getAlbum(albumId as string),
  });

  return data ? (
    <View style={{ marginTop: 16, marginBottom: 80, paddingHorizontal: 16 }}>
      <SectionHeader title="About" />
      <Text style={{ fontSize: 18 }}>{data.description}</Text>
    </View>
  ) : null;
};

interface AlbumPageContentProps {
  loadTrackList: LoadTrackList;
}

const AlbumPageContent = memo(({ loadTrackList }: AlbumPageContentProps) => {
  const { albumId } = useLocalSearchParams();
  const { data = [] } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => getAlbumTracks(albumId as string),
  });
  const handleRowPress = async (index: number, playerTitle: string) => {
    await loadTrackList({
      trackList: formatTrackListForMusicPlayer(data),
      trackListId: albumId as string,
      startIndex: index,
      playerTitle,
    });
  };

  return (
    <FlatList
      data={data}
      ListHeaderComponent={() => {
        if (data.length === 0) {
          return null;
        }

        const { artworkUrl, albumTitle } = data[0];

        return (
          <View style={{ marginBottom: 36 }}>
            <AlbumOrArtistPageHeader
              type="album"
              shareUrl={`https://wavlake.com/album/${albumId}`}
              artworkUrl={artworkUrl}
              trackListId={albumId as string}
              trackListTitle={albumTitle}
              onPlay={handleRowPress}
            />
          </View>
        );
      }}
      renderItem={({ item, index }) => {
        const { albumTitle, artist } = item;
        const isLastItem = index === data.length - 1;

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
      ListFooterComponent={AlbumPageFooter}
      keyExtractor={(item) => item.id}
      style={{ paddingTop: 8 }}
    />
  );
});

export const AlbumPage = () => {
  const { loadTrackList } = useMusicPlayer();

  return <AlbumPageContent loadTrackList={loadTrackList} />;
};
