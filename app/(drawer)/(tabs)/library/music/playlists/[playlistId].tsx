import { Center, LogoIcon, Text, useMiniMusicPlayer } from "@/components";
import { getPlaylist } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

export default function PlaylistsPage() {
  const { playlistId } = useLocalSearchParams();

  const { data: playlistTracks } = useQuery({
    queryKey: [playlistId],
    queryFn: () => getPlaylist(playlistId as string),
  });
  const { height } = useMiniMusicPlayer();

  const handleRowPress = (id: string) => {
    // TODO - add playlist to queue and start playing the chosen track id
    console.log("press", id);
  };

  return playlistTracks ? (
    <View style={{ height: "100%", paddingTop: 16 }}>
      <FlatList
        data={playlistTracks}
        renderItem={({ item, index }) => {
          const { id, title } = item;
          const isLastRow = index === playlistTracks.length - 1;
          const marginBottom = isLastRow ? height + 16 : 16;

          return (
            <TouchableOpacity onPress={() => handleRowPress(id)}>
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
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        scrollEnabled
      />
    </View>
  ) : (
    <Center>
      <ActivityIndicator />
    </Center>
  );
}
