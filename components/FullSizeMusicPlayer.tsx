import {
  View,
  Dimensions,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Pressable,
} from "react-native";
import { Slider } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { SongArtwork } from "./SongArtwork";
import { Text } from "./Text";
import { Center } from "./Center";
import { formatTime } from "@/utils";
import { useTheme } from "@react-navigation/native";

export const FullSizeMusicPlayer = () => {
  const { colors } = useTheme();
  const {
    currentSong,
    positionInMs,
    pauseStatusUpdates,
    setPosition,
    isPlaying,
    togglePlayPause,
    back,
    forward,
  } = useMusicPlayer();
  const { artworkUrl, title, artist, durationInMs } = currentSong || {};
  const screenWidth = Dimensions.get("window").width;
  const padding = 24;

  return currentSong ? (
    <View style={{ paddingTop: 8 }}>
      {artworkUrl && <SongArtwork size={screenWidth} url={artworkUrl} />}
      <View style={{ padding }}>
        <View style={{ maxWidth: screenWidth - padding * 2 }}>
          <Text numberOfLines={2} bold style={{ fontSize: 20 }}>
            {title}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 18 }}>
            {artist}
          </Text>
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
            <Pressable onPress={back}>
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
                {isPlaying ? (
                  <Ionicons
                    name="ios-pause-circle-sharp"
                    size={80}
                    color={colors.text}
                  />
                ) : (
                  <Ionicons
                    name="ios-play-circle-sharp"
                    size={80}
                    color={colors.text}
                  />
                )}
              </View>
            </Pressable>
            <Pressable onPress={forward}>
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
