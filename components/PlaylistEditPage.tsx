import { getPlaylist } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { brandColors } from "@/constants";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useReorderPlaylist } from "@/hooks/playlist/useReorderPlaylist";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";
import { Center } from "./shared/Center";
import { Button } from "./shared/Button";
import { Text } from "./shared/Text";
import { SquareArtwork } from "./SquareArtwork";

export const PlaylistEditPage = () => {
  const basePath = useGetBasePathname();
  const router = useRouter();
  const { playlistId } = useLocalSearchParams();
  const { data: playlistData, isLoading } = useQuery({
    queryKey: [playlistId],
    queryFn: () => getPlaylist(playlistId as string),
  });
  const { mutateAsync: reorderPlaylist, isLoading: reorderPlaylistLoading } =
    useReorderPlaylist(
      // this is used to invalidate the playlist query
      playlistId as string,
    );
  const { tracks = [] } = playlistData || {};
  const { height } = useMiniMusicPlayer();
  const [editedTracks, setEditedTracks] = useState(tracks);

  useEffect(() => {
    if (tracks) {
      setEditedTracks(tracks);
    }
  }, [tracks]);

  const onSave = async () => {
    const newOrder = editedTracks.map((track) => track.id);
    const { success } = await reorderPlaylist({
      playlistId: playlistId as string,
      trackList: newOrder,
    });

    if (success) {
      router.push({
        pathname: `${basePath}/playlist/${playlistId}`,
        params: {
          headerTitle: playlistData?.title ?? "Playlist",
          includeBackButton: "true",
        },
      });
    }
  };

  const handleDelete = (index?: number) => {
    if (index === undefined) return;
    const newTracks = editedTracks.filter((_, i) => i !== index);
    setEditedTracks(newTracks);
  };

  if (isLoading) {
    return (
      <Center>
        <ActivityIndicator />
      </Center>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        marginBottom: height + 50,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 24,
          padding: 8,
        }}
      >
        <Button
          color={brandColors.pink.DEFAULT}
          titleStyle={{
            color: brandColors.black.DEFAULT,
            marginHorizontal: "auto",
          }}
          onPress={onSave}
          loading={reorderPlaylistLoading}
        >
          Save Changes
        </Button>
      </View>
      <DraggableFlatList
        data={editedTracks}
        contentContainerStyle={{}}
        onDragEnd={({ data }) => setEditedTracks(data)}
        autoscrollThreshold={100}
        autoscrollSpeed={200}
        renderItem={({ item, getIndex, drag, isActive }) => {
          const index = getIndex();
          const { id, title, artist, artworkUrl } = item;

          return (
            <ScaleDecorator>
              <TouchableOpacity
                activeOpacity={1}
                onLongPress={drag}
                disabled={isActive}
              >
                <View
                  style={{
                    flexDirection: "row",
                    marginBottom: 16,
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Pressable
                    style={{
                      width: 40,
                      height: 40,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => handleDelete(index)}
                  >
                    <MaterialCommunityIcons
                      name={"close-circle"}
                      size={30}
                      color={"white"}
                    />
                  </Pressable>
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
                  <MaterialCommunityIcons
                    name={"menu"}
                    size={24}
                    color={"gray"}
                  />
                </View>
              </TouchableOpacity>
            </ScaleDecorator>
          );
        }}
        keyExtractor={(item, index) => item.id + index}
        scrollEnabled
        ListEmptyComponent={
          <Center style={{ flexGrow: 1 }}>
            <Text>This playlist is empty.</Text>
          </Center>
        }
      />
    </View>
  );
};
