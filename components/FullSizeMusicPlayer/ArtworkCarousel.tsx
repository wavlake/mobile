import { Dimensions, FlatList, View } from "react-native";
import { useMemo, useRef, useEffect } from "react";
import { TrackArtwork } from "@/components/TrackArtwork";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";

export const ArtworkCarousel = () => {
  const artworkUrlListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;
  const { trackQueue, currentTrackIndex } = useMusicPlayer();
  const trackQueueArtworkUrls = useMemo(
    () => trackQueue.map((track) => track.artworkUrl),
    [trackQueue],
  );

  useEffect(() => {
    artworkUrlListRef.current?.scrollToIndex({
      index: currentTrackIndex,
    });
  }, [currentTrackIndex]);

  return (
    <FlatList
      ref={artworkUrlListRef}
      horizontal
      initialScrollIndex={currentTrackIndex}
      initialNumToRender={1}
      getItemLayout={(data, index) => ({
        length: screenWidth,
        offset: screenWidth * index,
        index,
      })}
      data={trackQueueArtworkUrls}
      renderItem={({ item }) => (
        <View
          key={item}
          style={{
            alignItems: "center",
            width: screenWidth,
          }}
        >
          <TrackArtwork size={screenWidth - padding * 2} url={item} />
        </View>
      )}
      scrollEnabled={false}
    />
  );
};
