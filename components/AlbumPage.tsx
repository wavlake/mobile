import { useLocalSearchParams } from "expo-router";
import { Dimensions, FlatList, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { formatTrackListForMusicPlayer, getAlbumTracks } from "@/utils";
import { TrackArtwork } from "@/components/TrackArtwork";
import { Text } from "@/components/Text";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { PlayPauseTrackButton } from "@/components/PlayPauseTrackButton";
import { SatsEarned } from "@/components/SatsEarned";

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
        marginBottom: 24,
      }}
    >
      <TrackArtwork size={screenWidth} url={artworkUrl} />
      <View
        style={{
          position: "absolute",
          width: "100%",
          paddingHorizontal: 24,
          bottom: 24,
          alignItems: "flex-end",
        }}
      >
        <PlayPauseTrackButton
          size={56}
          type={isThisAlbumPlaying ? "pause" : "play"}
          onPress={handlePlayPausePress}
        />
      </View>
    </View>
  );
};

export const AlbumPage = () => {
  const { albumId } = useLocalSearchParams();
  const { data = [] } = useQuery({
    queryKey: [albumId],
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
      keyExtractor={(item) => item.id}
      style={{ paddingTop: 8 }}
    />
  );
};
