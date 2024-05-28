import {
  Center,
  ShareIcon,
  SquareArtwork,
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
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { State, usePlaybackState } from "react-native-track-player";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { EditPlaylistDialog } from "@/components/Playlist/EditPlaylistDialog";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { ShareButton } from "./ShareButton";

export const PlaylistPage = () => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const { playlistId } = useLocalSearchParams();
  const { loadTrackList, currentTrackListId } = useMusicPlayer();
  const { state: playbackState } = usePlaybackState();
  const [moreIsOpen, setMoreIsOpen] = useState(false);
  const isThisTrackListLoaded = playlistId === currentTrackListId;
  const isThisTrackListPlaying =
    isThisTrackListLoaded && playbackState !== State.Paused;
  const {
    data: playlistData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [playlistId],
    queryFn: () => getPlaylist(playlistId as string),
  });
  const { tracks = [], title } = playlistData || {};
  const { height } = useMiniMusicPlayer();

  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: tracks,
      trackListId: playlistId as string,
      startIndex: index,
      playerTitle: title,
    });
  };

  const handlePlayPausePress = () => {
    if (isThisTrackListLoaded) {
      return togglePlayPause();
    }

    return loadTrackList({
      trackList: tracks,
      trackListId: playlistId as string,
      startIndex: 0,
      playerTitle: title,
    });
  };

  const handleMorePress = () => {
    setMoreIsOpen(true);
  };
  const isOwner = pubkey === playlistData?.userId;
  return tracks ? (
    <View style={{ height: "100%", paddingTop: 8, gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 24,
          padding: 8,
        }}
      >
        {!!tracks && (
          <PlayPauseTrackButton
            size={40}
            color={brandColors.pink.DEFAULT}
            type={isThisTrackListPlaying ? "pause" : "play"}
            onPress={handlePlayPausePress}
          />
        )}
        <Text
          style={{
            fontSize: 24,
            textAlign: "left",
            flex: 1,
          }}
          numberOfLines={3}
          bold
        >
          {title}
        </Text>
        {isOwner ? (
          <Pressable onPress={handleMorePress} hitSlop={10}>
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={24}
              color={colors.text}
            />
          </Pressable>
        ) : (
          <ShareButton url={`https://wavlake.com/playlist/${playlistId}`} />
        )}
      </View>
      <FlatList
        data={tracks}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        renderItem={({ item, index }) => {
          const { id, title, artist, artworkUrl } = item;
          const isLastRow = index === tracks.length - 1;
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
                <SquareArtwork size={60} url={artworkUrl} />
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
                  <Text numberOfLines={1}>{artist}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => item.id + index}
        scrollEnabled
        ListEmptyComponent={
          <Center>
            <Text>No tracks in this playlist yet.</Text>
          </Center>
        }
      />
      {moreIsOpen && (
        <EditPlaylistDialog
          playlistId={playlistId as string}
          playlistTitle={title as string}
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
};
