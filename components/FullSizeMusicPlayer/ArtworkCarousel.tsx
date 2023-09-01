import { Dimensions, FlatList, View } from "react-native";
import { useMemo, useRef, useEffect } from "react";
import { SongArtwork } from "@/components/SongArtwork";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";

export const ArtworkCarousel = () => {
  const artworkUrlListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;
  const { songQueue, currentSongIndex } = useMusicPlayer();
  const songQueueArtworkUrls = useMemo(
    () => songQueue.map((song) => song.artworkUrl),
    [songQueue],
  );

  useEffect(() => {
    artworkUrlListRef.current?.scrollToIndex({
      index: currentSongIndex,
    });
  }, [currentSongIndex]);

  return (
    <FlatList
      ref={artworkUrlListRef}
      horizontal
      initialScrollIndex={currentSongIndex}
      initialNumToRender={1}
      getItemLayout={(data, index) => ({
        length: screenWidth,
        offset: screenWidth * index,
        index,
      })}
      data={songQueueArtworkUrls}
      renderItem={({ item }) => (
        <View
          key={item}
          style={{
            alignItems: "center",
            width: screenWidth,
          }}
        >
          <SongArtwork size={screenWidth - padding * 2} url={item} />
        </View>
      )}
      scrollEnabled={false}
    />
  );
};
