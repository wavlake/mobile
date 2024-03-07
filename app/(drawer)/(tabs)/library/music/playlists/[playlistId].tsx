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

  const { data: playlist } = useQuery({
    queryKey: [playlistId],
    queryFn: () => getPlaylist(playlistId as string),
  });
  const { height } = useMiniMusicPlayer();

  const handleRowPress = (index: number) => {
    console.log("press");
  };
  const data = [
    {
      id: "123",
      userId: "asdf",
      title: "asdfasdfasdf",
      isFavorites: false,
      createdAt: "asdf",
      updatedAt: "asdf",
    },
    {
      id: "123",
      userId: "asdf",
      title: "qweqweqwe",
      isFavorites: false,
      createdAt: "asdf",
      updatedAt: "asdf",
    },
  ];
  return playlist ? (
    <View style={{ height: "100%", paddingTop: 16 }}>
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          const { id, userId, title, isFavorites, createdAt, updatedAt } = item;
          const isLastRow = index === data.length - 1;
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
