import { useState } from "react";
import {
  LayoutChangeEvent,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Text, SongArtwork, useMusicPlayer } from "@/components";
import { useNewMusic } from "@/hooks";
import { formatMusicItemForMusicPlayer } from "@/utils";

export default function DiscoverPage() {
  const { data } = useNewMusic();
  const [songMetadataContainerWidth, setSongMetadataContainerWidth] =
    useState(0);
  const { loadItemList } = useMusicPlayer();

  const handleSongMetadataContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSongMetadataContainerWidth(width);
  };
  const handleRowPress = async (index: number) => {
    await loadItemList({
      itemList: formatMusicItemForMusicPlayer(data),
      startIndex: index,
      playerTitle: "New music",
    });
  };

  return (
    <View style={{ height: "100%", paddingTop: 16 }}>
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          const { artworkUrl, title, artist } = item;

          return (
            <TouchableOpacity onPress={() => handleRowPress(index)}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 16,
                }}
              >
                <SongArtwork size={124} url={artworkUrl} />
                <View
                  style={{ marginLeft: 10, flex: 1 }}
                  onLayout={handleSongMetadataContainerLayout}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      maxWidth: songMetadataContainerWidth,
                    }}
                    numberOfLines={3}
                    bold
                  >
                    {title}
                  </Text>
                  <Text>{artist}</Text>
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
