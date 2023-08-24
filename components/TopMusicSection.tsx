import { brandColors } from "../constants";
import { SectionHeader } from "./SectionHeader";
import { useQuery } from "@tanstack/react-query";
import { getTopMusic } from "../utils";
import { Image, LayoutChangeEvent, View } from "react-native";
import { FireIcon } from "./FireIcon";
import { Text } from "./Text";
import { BadgeIcon } from "./BadgeIcon";
import { useState } from "react";

export const TopMusicSection = () => {
  const { data = [] } = useQuery({
    queryKey: ["topMusic"],
    queryFn: getTopMusic,
  });
  const [songMetadataContainerWidth, setSongMetadataContainerWidth] =
    useState(0);

  const handleSongMetadataContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSongMetadataContainerWidth(width);
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
          rightNavText="Top 40"
          rightNavHref="/top-40"
        />
      </View>
      {data.map((item, index) => {
        const { artworkUrl, title, artist } = item;
        const isFirstRow = index === 0;
        const artworkSize = isFirstRow ? 154 : 100;

        return (
          <View
            key={index}
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
            <Image
              source={{ uri: artworkUrl }}
              style={{ width: artworkSize, height: artworkSize }}
            />
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
                numberOfLines={3}
                bold
              >
                {title}
              </Text>
              <Text>{artist}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};
