import {
  Button,
  Center,
  LogoIcon,
  Text,
  useMiniMusicPlayer,
} from "@/components";
import { getPlaylist } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { brandColors } from "@/constants";
import DraggableFlatList from "react-native-draggable-flatlist";

export default function PlaylistsPage() {
  const router = useRouter();
  const { playlistId } = useLocalSearchParams();
  const { data: playlistData } = useQuery({
    queryKey: [playlistId],
    queryFn: () => getPlaylist(playlistId as string),
  });
  const { tracks = [] } = playlistData || {};
  const { height } = useMiniMusicPlayer();

  const onSave = () => {
    // TODO add edit mutation
    console.log("onsave");
    router.back();
  };

  return tracks ? (
    <View style={{ height: "100%", paddingTop: 8, gap: 8 }}>
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
        data={tracks}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item, getIndex }) => {
          const index = getIndex();
          const { id, title, artist } = item;
          const isLastRow = index === tracks.length - 1;
          const marginBottom = isLastRow ? height + 16 : 16;

          return (
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
    </View>
  ) : (
    <Center>
      <ActivityIndicator />
    </Center>
  );
}
