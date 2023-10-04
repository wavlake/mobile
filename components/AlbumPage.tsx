import { useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  Album,
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

interface AlbumPageFooterProps {
  album: Album;
}

const AlbumPageFooter = ({ album }: AlbumPageFooterProps) => {
  return (
    <View style={{ marginTop: 16, marginBottom: 80, paddingHorizontal: 16 }}>
      <SectionHeader title="About" />
      <Text style={{ fontSize: 18 }}>{album.description}</Text>
    </View>
  );
};

interface AlbumPageContentProps {
  loadTrackList: LoadTrackList;
}

const AlbumPageContent = memo(({ loadTrackList }: AlbumPageContentProps) => {
  const { albumId } = useLocalSearchParams();
  const { data: album } = useQuery({
    queryKey: [albumId],
    queryFn: () => getAlbum(albumId as string),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => getAlbumTracks(albumId as string),
  });
  const handleRowPress = async (index: number, playerTitle: string) => {
    await loadTrackList({
      trackList: formatTrackListForMusicPlayer(tracks),
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

        const { id, title } = album;

        return (
          <View style={{ marginBottom: 36 }}>
            <AlbumOrArtistPageHeader
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
        album ? <AlbumPageFooter album={album} /> : null
      }
      keyExtractor={(item) => item.id}
      style={{ paddingTop: 8 }}
    />
  );
});

export const AlbumPage = () => {
  const { loadTrackList } = useMusicPlayer();

  return <AlbumPageContent loadTrackList={loadTrackList} />;
};
