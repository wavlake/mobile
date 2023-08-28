import { brandColors } from "@/constants";
import { SectionHeader } from "./SectionHeader";
import { useQuery } from "@tanstack/react-query";
import { getTopMusic } from "@/utils";
import { LayoutChangeEvent, View, TouchableOpacity } from "react-native";
import { FireIcon } from "./FireIcon";
import { Text } from "./Text";
import { BadgeIcon } from "./BadgeIcon";
import { useState } from "react";
import { SongArtwork } from "./SongArtwork";
import { useMusicPlayer, LoadParams } from "./MusicPlayerProvider";

export const TopMusicSection = () => {
  const { data = [] } = useQuery({
    queryKey: ["topMusic"],
    queryFn: getTopMusic,
  });
  const [songMetadataContainerWidth, setSongMetadataContainerWidth] =
    useState(0);
  const { loadSong } = useMusicPlayer();

  const handleSongMetadataContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSongMetadataContainerWidth(width);
  };
  const handleRowPress = async (loadParams: LoadParams) => {
    await loadSong(loadParams);
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
        const { liveUrl, artworkUrl, title, artist, duration, id } = item;
        const isFirstRow = index === 0;
        const artworkSize = isFirstRow ? 154 : 100;

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
              {!isFirstRow && (
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
              )}
              <SongArtwork size={artworkSize} url={artworkUrl} />
              <View
                style={{ marginLeft: 10, flex: 1 }}
                onLayout={handleSongMetadataContainerLayout}
              >
                {isFirstRow && (
                  <View style={{ marginVertical: 8 }}>
                    <BadgeIcon
                      fill={brandColors.mint.DEFAULT}
                      width={48}
                      height={48}
                    />
                    <Text
                      style={{
                        fontSize: 28,
                        position: "absolute",
                        top: 5,
                        left: 18,
                      }}
                      bold
                    >
                      1
                    </Text>
                  </View>
                )}
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