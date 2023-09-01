import { Dimensions, FlatList, View } from "react-native";
import {
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { SongArtwork } from "@/components/SongArtwork";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { usePrevious } from "@/hooks";

export interface ArtworkCarouselRef {
  back: () => void;
  next: () => void;
}

export const ArtworkCarousel = forwardRef((_, ref) => {
  const artworkUrlListRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;
  const { songQueue, currentSongIndex, canGoBack } = useMusicPlayer();
  const previousSongIndex = usePrevious(currentSongIndex);
  const songQueueArtworkUrls = useMemo(
    () => songQueue.map((song) => song.artworkUrl),
    [songQueue],
  );

  useImperativeHandle(
    ref,
    () => ({
      back: () => {
        if (canGoBack() && artworkUrlListRef.current) {
          artworkUrlListRef.current.scrollToIndex({
            index: currentSongIndex - 1,
          });
        }
      },
      next: () => {
        if (
          currentSongIndex < songQueue.length - 1 &&
          artworkUrlListRef.current
        ) {
          artworkUrlListRef.current.scrollToIndex({
            index: currentSongIndex + 1,
          });
        }
      },
    }),
    [currentSongIndex],
  );

  useEffect(() => {
    if (
      previousSongIndex !== undefined &&
      currentSongIndex > previousSongIndex &&
      artworkUrlListRef.current
    ) {
      artworkUrlListRef.current.scrollToIndex({
        index: currentSongIndex,
      });
    }
  }, [previousSongIndex, currentSongIndex]);

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
});
