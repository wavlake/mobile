import { usePromos } from "@/hooks";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { Center } from "./Center";
import {
  SquareArtwork,
  Text,
  useMiniMusicPlayer,
  useMusicPlayer,
} from "@/components";
import { Track } from "@/utils";

export const ListenToEarnPage = () => {
  const { height } = useMiniMusicPlayer();
  const { data: promos = [], isLoading, refetch } = usePromos();
  const { loadTrackList } = useMusicPlayer();
  const handleRowPress = (item: Track) => {
    loadTrackList({
      trackList: [item],
      trackListId: "earning",
      startIndex: 0,
      playerTitle: "Earning",
    });
  };

  return (
    <FlatList
      contentContainerStyle={{ flexGrow: 1 }}
      ListHeaderComponent={() => (
        <Center
          style={{
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Promoted
          </Text>
          <Text
            style={{
              fontSize: 14,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            You can earn sats to listen to any of the following tracks. Limit
            1000 sats per user per day.
          </Text>
        </Center>
      )}
      data={promos}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      renderItem={({ item, index }) => {
        const { contentMetadata } = item;
        const isLastRow = index === promos.length - 1;
        const marginBottom = isLastRow ? height + 16 : 16;
        const onPress = () => handleRowPress(contentMetadata);
        return (
          <TouchableOpacity style={{ marginBottom }} onPress={onPress}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 10,
              }}
            >
              <SquareArtwork size={150} url={contentMetadata.artworkUrl} />

              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Text style={{ fontSize: 18 }} numberOfLines={2} bold>
                  {contentMetadata.title}
                </Text>
                <Text>{contentMetadata.artist}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.contentId}
      scrollEnabled
      ListEmptyComponent={
        <Center>
          <Text>
            There are currently no active promos available to you, please check
            back tomorrow.
          </Text>
        </Center>
      }
    />
  );
};
