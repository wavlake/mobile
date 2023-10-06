import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Slider } from "@rneui/themed";
import { formatTime } from "@/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { Text } from "@/components/Text";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { useState } from "react";
import { PlayPauseTrackButton } from "@/components/PlayPauseTrackButton";

interface PlayerControlsProps {
  isSmallScreen: boolean;
}

export const PlayerControls = ({ isSmallScreen }: PlayerControlsProps) => {
  const { colors } = useTheme();
  const {
    positionInMs,
    pauseStatusUpdates,
    setPosition,
    status,
    togglePlayPause,
    back,
    forward,
    currentTrack,
  } = useMusicPlayer();
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const { durationInMs } = currentTrack || {};
  const handleBackPress = async () => {
    if (isChangingTrack) {
      return;
    }

    setIsChangingTrack(true);
    await back();
    setIsChangingTrack(false);
  };
  const handleForwardPress = async () => {
    if (isChangingTrack) {
      return;
    }

    setIsChangingTrack(true);
    await forward();
    setIsChangingTrack(false);
  };

  return (
    <View>
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
          paddingTop: isSmallScreen ? 8 : 16,
        }}
      >
        <Pressable onPress={handleBackPress}>
          <Ionicons
            name="ios-play-skip-back-sharp"
            size={36}
            color={colors.text}
          />
        </Pressable>
        <PlayPauseTrackButton
          size={80}
          type={status === "playing" ? "pause" : "play"}
          onPress={togglePlayPause}
        />
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
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "Roboto",
    letterSpacing: 0.5,
  },
});
