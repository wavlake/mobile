import { useLocalSearchParams } from "expo-router";
import { Dimensions, FlatList, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import {
  formatTrackListForMusicPlayer,
  getAlbum,
  getAlbumTracks,
} from "@/utils";
import { TrackArtwork } from "@/components/TrackArtwork";
import { Text } from "@/components/Text";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { PlayPauseTrackButton } from "@/components/PlayPauseTrackButton";
import { SatsEarned } from "@/components/SatsEarned";
import { ShareButton } from "@/components/ShareButton";

interface AlbumPageHeaderProps {
  artworkUrl: string;
  albumTitle: string;
  albumId: string;
  onPlay: (index: number, playerTitle: string) => void;
}

const AlbumPageHeader = ({
  artworkUrl,
  albumTitle,
  albumId,
  onPlay,
}: AlbumPageHeaderProps) => {
  const { currentTrackListId, status, togglePlayPause } = useMusicPlayer();
  const screenWidth = Dimensions.get("window").width;
  const isThisAlbumLoaded = currentTrackListId === albumId;
  const isThisAlbumPlaying = status === "playing" && isThisAlbumLoaded;
  const handlePlayPausePress = () => {
    if (isThisAlbumLoaded) {
      return togglePlayPause();
    }

    return onPlay(0, albumTitle);
  };

  return (
    <View
      style={{
        marginBottom: 36,
      }}
    >
      <TrackArtwork size={screenWidth} url={artworkUrl} />
      <View
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          flexDirection: "row",
          gap: 24,
        }}
      >
        <ShareButton url={`https://wavlake.com/album/${albumId}`} withText />
        <PlayPauseTrackButton
          size={56}
          type={isThisAlbumPlaying ? "pause" : "play"}
          onPress={handlePlayPausePress}
        />
      </View>
    </View>
  );
};

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

export const AlbumPage = () => {
  const { albumId } = useLocalSearchParams();
  const { data = [] } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => getAlbumTracks(albumId as string),
  });
  const { loadTrackList } = useMusicPlayer();
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
          <AlbumPageHeader
            albumTitle={albumTitle}
            artworkUrl={artworkUrl}
            albumId={albumId as string}
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
              {artist}
            </Text>
            <Text>{title}</Text>
            <SatsEarned msats={msatTotal} />
          </TouchableOpacity>
        );
      }}
      ListFooterComponent={AlbumPageFooter}
      keyExtractor={(item) => item.id}
      style={{ paddingTop: 8 }}
    />
  );
};
