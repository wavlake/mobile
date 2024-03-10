import {
  Center,
  LogoIcon,
  Text,
  useMiniMusicPlayer,
  useMusicPlayer,
} from "@/components";
import { PlayPauseTrackButton } from "@/components/PlayPauseTrackButton";
import { brandColors } from "@/constants";
import { getPlaylist, togglePlayPause } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { State, usePlaybackState } from "react-native-track-player";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { EditPlaylistDialog } from "@/components/Playlist/EditPlaylistDialog";

export default function PlaylistsPage() {
  const { playlistId, playlistTitle } = useLocalSearchParams();
  const { loadTrackList, currentTrackListId } = useMusicPlayer();
  const { state: playbackState } = usePlaybackState();
  const [moreIsOpen, setMoreIsOpen] = useState(false);
  const isThisTrackListLoaded = playlistId === currentTrackListId;
  const isThisTrackListPlaying =
    isThisTrackListLoaded && playbackState !== State.Paused;

  const { data: playlistTracks = [] } = useQuery({
    queryKey: [playlistId],
    queryFn: () => getPlaylist(playlistId as string),
  });
  const { height } = useMiniMusicPlayer();

  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: playlistTracks,
      trackListId: playlistId as string,
      startIndex: index,
      playerTitle: playlistTitle as string,
    });
  };

  const handlePlayPausePress = () => {
    if (isThisTrackListLoaded) {
      return togglePlayPause();
    }

    return loadTrackList({
      trackList: playlistTracks,
      trackListId: playlistId as string,
      startIndex: 0,
      playerTitle: playlistTitle as string,
    });
  };

  const handleMorePress = () => {
    setMoreIsOpen(true);
  };

  return playlistTracks ? (
    <View style={{ height: "100%", paddingTop: 8, gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 24,
          padding: 8,
        }}
      >
        <PlayPauseTrackButton
          size={40}
          color={brandColors.pink.DEFAULT}
          type={isThisTrackListPlaying ? "pause" : "play"}
          onPress={handlePlayPausePress}
        />
        <Text
          style={{
            fontSize: 24,
            textAlign: "left",
            flex: 1,
          }}
          numberOfLines={3}
          bold
        >
          {playlistTitle}
        </Text>
        <Pressable onPress={handleMorePress}>
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={24}
            color={brandColors.pink.DEFAULT}
          />
        </Pressable>
      </View>
      <FlatList
        data={playlistTracks}
        renderItem={({ item, index }) => {
          const { id, title, artist } = item;
          const isLastRow = index === playlistTracks.length - 1;
          const marginBottom = isLastRow ? height + 16 : 16;

          return (
            <TouchableOpacity onPress={() => handleRowPress(index)}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {/* TODO - swap placeholder with artwork of first track */}
                <LogoIcon fill="white" width={60} height={60} />
                {/* <SquareArtwork size={60} url={artworkUrl} /> */}
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                    numberOfLines={3}
                    bold
                  >
                    {title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                    numberOfLines={3}
                    bold
                  >
                    {artist}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => item.id + index}
        scrollEnabled
      />
      {moreIsOpen && (
        <EditPlaylistDialog
          playlistId={playlistId as string}
          playlistTitle={playlistTitle as string}
          isOpen={moreIsOpen}
          setIsOpen={setMoreIsOpen}
        />
      )}
    </View>
  ) : (
    <Center>
      <ActivityIndicator />
    </Center>
  );
}
