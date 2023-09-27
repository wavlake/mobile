import { useLocalSearchParams } from "expo-router";
import { FlatList, TouchableOpacity, View } from "react-native";
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
import { SatsEarned } from "@/components/SatsEarned";
import { memo } from "react";
import { AlbumOrArtistPageHeader } from "@/components/AlbumOrArtistPageHeader";

const AlbumPageFooter = () => {
  const { albumId } = useLocalSearchParams();
  const { data } = useQuery({
    queryKey: [albumId],
    queryFn: () => getAlbum(albumId as string),
  });

  return data ? (
    <View style={{ marginTop: 16, marginBottom: 80, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 18 }} bold>
        About
      </Text>
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
          <AlbumOrArtistPageHeader
            type="album"
            shareUrl={`https://wavlake.com/album/${albumId}`}
            artworkUrl={artworkUrl}
            trackListId={albumId as string}
            trackListTitle={albumTitle}
            onPlay={handleRowPress}
          />
        );
      }}
      renderItem={({ item, index }) => {
        const { title, albumTitle, artist, msatTotal } = item;

        return (
          <TouchableOpacity
            onPress={() => handleRowPress(index, albumTitle)}
            style={{
              height: 60,
              justifyContent: "center",
              marginBottom: 16,
              paddingHorizontal: 16,
            }}
          >
            <Text style={{ fontSize: 18 }} bold>
              {title}
            </Text>
            <Text>{artist}</Text>
            <SatsEarned msats={msatTotal} />
          </TouchableOpacity>
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
