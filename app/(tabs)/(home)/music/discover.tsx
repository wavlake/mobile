import { useState } from "react";
import {
  LayoutChangeEvent,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  Text,
  SongArtwork,
  useMusicPlayer,
  MusicPlayerItem,
} from "@/components";
import { useNewMusic } from "@/hooks";

export default function DiscoverPage() {
  const { data } = useNewMusic();
  const [songMetadataContainerWidth, setSongMetadataContainerWidth] =
    useState(0);
  const { loadItem } = useMusicPlayer();

  const handleSongMetadataContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSongMetadataContainerWidth(width);
  };
  const handleRowPress = async (item: MusicPlayerItem) => {
    await loadItem(item);
  };

  return (
    <View style={{ height: "100%", paddingTop: 16 }}>
      <FlatList
        data={data}
        renderItem={({ item }) => {
          const { liveUrl, artworkUrl, title, artist, duration, id } = item;

          return (
            <TouchableOpacity
              key={id}
              onPress={() =>
                handleRowPress({
                  liveUrl,
                  artworkUrl,
                  title,
                  artist,
                  durationInMs: duration * 1000,
                })
              }
            >
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
        scrollEnabled
      />
    </View>
  );
}
