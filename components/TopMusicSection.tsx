import { brandColors } from "@/constants";
import { SectionHeader } from "./SectionHeader";
import { useQuery } from "@tanstack/react-query";
import { formatTrackListForMusicPlayer, getTopMusic } from "@/utils";
import { LayoutChangeEvent, View, TouchableOpacity } from "react-native";
import { FireIcon } from "./FireIcon";
import { Text } from "./Text";
import { useState } from "react";
import { TrackArtwork } from "./TrackArtwork";
import { useMusicPlayer } from "./MusicPlayerProvider";

export const TopMusicSection = () => {
  const { data = [] } = useQuery({
    queryKey: ["topMusic"],
    queryFn: getTopMusic,
  });
  const [songMetadataContainerWidth, setSongMetadataContainerWidth] =
    useState(0);
  const { loadTrackList } = useMusicPlayer();

  const handleSongMetadataContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSongMetadataContainerWidth(width);
  };
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: formatTrackListForMusicPlayer(data),
      startIndex: index,
      playerTitle: "Trending",
    });
  };

  return (
    <View>
      <View style={{ paddingBottom: 16 }}>
        <SectionHeader
          title="Trending"
          icon={
            <FireIcon
              fill={brandColors.orange.DEFAULT}
              width={30}
              height={30}
            />
          }
        />
      </View>
      {data.map((item, index) => {
        const { artworkUrl, title, artist, id } = item;

        return (
          <TouchableOpacity key={id} onPress={() => handleRowPress(index)}>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  width: 48,
                  marginRight: 8,
                  textAlign: "center",
                  alignSelf: "center",
                }}
                bold
              >
                {index + 1}
              </Text>
              <TrackArtwork size={100} url={artworkUrl} />
              <View
                style={{ marginLeft: 10, flex: 1 }}
                onLayout={handleSongMetadataContainerLayout}
              >
                <Text
                  style={{ fontSize: 18, maxWidth: songMetadataContainerWidth }}
                  numberOfLines={2}
                  bold
                >
                  {title}
                </Text>
                <Text>{artist}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
