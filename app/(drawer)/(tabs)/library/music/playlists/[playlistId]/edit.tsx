import {
  Button,
  Center,
  SquareArtwork,
  Text,
  useMiniMusicPlayer,
} from "@/components";
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

export default function PlaylistsPage() {
  const router = useRouter();
  const { playlistId } = useLocalSearchParams();
  const { data: playlistData, isLoading } = useQuery({
    queryKey: [playlistId],
    queryFn: () => getPlaylist(playlistId as string),
  });
  const { mutateAsync: reorderPlaylist } = useReorderPlaylist(
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
        pathname: `/library/music/playlists/${playlistId}`,
        params: {
          headerTitle: "Songs",
          includeBackButton: true,
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
        height: "100%",
        paddingTop: 8,
        gap: 8,
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
        >
          Save Changes
        </Button>
      </View>
      <DraggableFlatList
        data={editedTracks}
        contentContainerStyle={{ height: "100%" }}
        onDragEnd={({ data }) => setEditedTracks(data)}
        renderItem={({ item, getIndex, drag, isActive }) => {
          const index = getIndex();
          const { id, title, artist, artworkUrl } = item;
          const isLastRow = index === tracks.length - 1;
          const marginBottom = isLastRow ? height + 16 : 16;

          return (
            <>
              <ScaleDecorator>
                <TouchableOpacity
                  activeOpacity={1}
                  onPressIn={drag}
                  disabled={isActive}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      marginBottom,
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
                        name={"delete"}
                        size={30}
                        color={"red"}
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
                      <Text
                        numberOfLines={1}
                      >
                        {artist}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={"menu"}
                      size={24}
                      color={"gray"}
                    />
                  </View>
                </TouchableOpacity>
              </ScaleDecorator>
            </>
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
}
