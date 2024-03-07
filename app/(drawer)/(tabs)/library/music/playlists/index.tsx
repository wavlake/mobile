import { LogoIcon, Text, useMiniMusicPlayer } from "@/components";
import { Playlist } from "@/utils";
import { useRouter } from "expo-router";
import { FlatList, TouchableOpacity, View } from "react-native";

export default function PlaylistsPage() {
  const { height } = useMiniMusicPlayer();
  const router = useRouter();
  const handleRowPress = (playlist: Playlist) => {
    router.push({
      pathname: `/library/music/playlists/${playlist.id}`,
      params: {
        headerTitle: playlist.title,
        includeBackButton: true,
      },
    });
  };
  const data = [
    {
      id: "123",
      userId: "asdf",
      title: "asdf",
      isFavorites: false,
      createdAt: "asdf",
      updatedAt: "asdf",
    },
    {
      id: "123",
      userId: "asdf",
      title: "asdf",
      isFavorites: false,
      createdAt: "asdf",
      updatedAt: "asdf",
    },
  ];
  return (
    <View style={{ height: "100%", paddingTop: 16 }}>
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          const { id, userId, title, isFavorites, createdAt, updatedAt } = item;
          const isLastRow = index === data.length - 1;
          const marginBottom = isLastRow ? height + 16 : 16;

          return (
            <TouchableOpacity onPress={() => handleRowPress(item)}>
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
  );
}
