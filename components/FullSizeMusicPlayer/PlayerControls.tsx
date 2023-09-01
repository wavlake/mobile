import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Slider } from "@rneui/themed";
import { formatTime } from "@/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { Text } from "@/components/Text";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { useState } from "react";

interface PlayerControlsProps {
  onBackPress?: () => void;
  onForwardPress?: () => void;
}

export const PlayerControls = ({
  onBackPress = () => {},
  onForwardPress = () => {},
}: PlayerControlsProps) => {
  const { colors } = useTheme();
  const {
    songQueue,
    currentSongIndex,
    positionInMs,
    pauseStatusUpdates,
    setPosition,
    status,
    togglePlayPause,
    back,
    forward,
  } = useMusicPlayer();
  const [isChangingSong, setIsChangingSong] = useState(false);
  const currentSong = songQueue[currentSongIndex];
  const { durationInMs } = currentSong || {};
  const padding = 24;
  const handleBackPress = async () => {
    if (isChangingSong) {
      return;
    }

    setIsChangingSong(true);
    onBackPress();
    await back();
    setIsChangingSong(false);
  };
  const handleForwardPress = async () => {
    if (isChangingSong) {
      return;
    }

    setIsChangingSong(true);
    onForwardPress();
    await forward();
    setIsChangingSong(false);
  };

  return (
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
        <Text style={styles.monospacedText}>{formatTime(positionInMs)}</Text>
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
  );
};

const styles = StyleSheet.create({
  monospacedText: {
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: -1,
    fontWeight: "bold",
  },
});
