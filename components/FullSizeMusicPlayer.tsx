import {
  View,
  Dimensions,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import { Slider } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { SongArtwork } from "./SongArtwork";
import { Text } from "./Text";
import { Center } from "./Center";
import { formatTime } from "@/utils";
import { useTheme } from "@react-navigation/native";
import { MarqueeText } from "@/components/MarqueeText";
import { useMemo, useRef, useState } from "react";

export const FullSizeMusicPlayer = () => {
  const { colors } = useTheme();
  const {
    songQueue,
    currentSongIndex,
    positionInMs,
    pauseStatusUpdates,
    setPosition,
    status,
    togglePlayPause,
    canGoBack,
    back,
    forward,
  } = useMusicPlayer();
  const [isChangingSong, setIsChangingSong] = useState(false);
  const artworkUrlListRef = useRef<FlatList>(null);
  const currentSong = songQueue[currentSongIndex];
  const songQueueArtworkUrls = useMemo(
    () => songQueue.map((song) => song.artworkUrl),
    [songQueue],
  );
  const { title, artist, durationInMs } = currentSong || {};
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;
  const handleBackPress = async () => {
    if (isChangingSong) {
      return;
    }

    setIsChangingSong(true);

    if (canGoBack() && artworkUrlListRef.current) {
      artworkUrlListRef.current.scrollToIndex({
        index: currentSongIndex - 1,
      });
    }

    await back();
    setIsChangingSong(false);
  };
  const handleForwardPress = async () => {
    if (isChangingSong) {
      return;
    }

    setIsChangingSong(true);

    if (currentSongIndex < songQueue.length - 1 && artworkUrlListRef.current) {
      artworkUrlListRef.current.scrollToIndex({
        index: currentSongIndex + 1,
      });
    }

    await forward();
    setIsChangingSong(false);
  };

  return currentSong ? (
    <View style={{ paddingTop: 8 }}>
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
      <View style={{ padding }}>
        <View style={{ maxWidth: screenWidth - padding * 2 }}>
          <MarqueeText style={{ fontSize: 20 }} bold>
            {title}
          </MarqueeText>
          <MarqueeText style={{ fontSize: 18 }}>{artist}</MarqueeText>
        </View>
        <View style={{ paddingVertical: padding }}>
          <Slider
            minimumTrackTintColor="white"
            thumbStyle={{ height: 12, width: 12, backgroundColor: "white" }}
            thumbTouchSize={{ width: 60, height: 60 }}
            maximumValue={durationInMs}
            value={positionInMs}
            onSlidingStart={pauseStatusUpdates}
            onSlidingComplete={setPosition}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: -8,
            }}
          >
            <Text style={styles.monospacedText}>
              {formatTime(positionInMs)}
            </Text>
            {durationInMs && (
              <Text style={styles.monospacedText}>
                -{formatTime(durationInMs - positionInMs)}
              </Text>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-evenly",
              paddingTop: 16,
            }}
          >
            <Pressable onPress={handleBackPress}>
              <Ionicons
                name="ios-play-skip-back-sharp"
                size={36}
                color={colors.text}
              />
            </Pressable>
            <Pressable onPress={togglePlayPause}>
              <View
                style={{
                  paddingLeft: 4,
                }}
              >
                {status === "playing" && (
                  <Ionicons
                    name="ios-pause-circle-sharp"
                    size={80}
                    color={colors.text}
                  />
                )}
                {status === "paused" && (
                  <Ionicons
                    name="ios-play-circle-sharp"
                    size={80}
                    color={colors.text}
                  />
                )}
              </View>
            </Pressable>
            <Pressable onPress={handleForwardPress}>
              <Ionicons
                name="ios-play-skip-forward-sharp"
                size={36}
                color={colors.text}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  ) : (
    <Center>
      <ActivityIndicator />
    </Center>
  );
};

const styles = StyleSheet.create({
  monospacedText: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: -1,
    fontWeight: "bold",
  },
});
