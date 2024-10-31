import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Slider } from "@rneui/themed";
import {
  formatTime,
  seekTo,
  skipToNext,
  skipToPrevious,
  togglePlayPause,
} from "@/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { Text } from "../shared/Text";
import { useEffect, useState } from "react";
import { PlayPauseTrackButton } from "../PlayPauseTrackButton";
import {
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { useMusicPlayer } from "../MusicPlayerProvider";
import { BottomControlBar } from "./BottomControlBar";

interface PlayerControlsProps {
  isSmallScreen: boolean;
  color?: string;
}

export const PlayerControls = ({
  isSmallScreen,
  color,
}: PlayerControlsProps) => {
  const { colors } = useTheme();
  const { position, duration } = useProgress();
  const { state: playbackState } = usePlaybackState();
  const [sliderValue, setSliderValue] = useState(position);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    if (!isSliding) {
      setSliderValue(position);
    }
  }, [position, isSliding]);

  const isPlaying = playbackState === State.Playing;
  return (
    <View
      style={{
        paddingTop: isSmallScreen ? 12 : 24,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Slider
        minimumTrackTintColor="white"
        thumbStyle={{ height: 12, width: 12, backgroundColor: "white" }}
        thumbTouchSize={{ width: 60, height: 60 }}
        maximumValue={duration}
        value={sliderValue}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={async (value) => {
          await seekTo(value);
          setSliderValue(value);

          // need to give it a second otherwise sometimes the transition isn't smooth
          setTimeout(() => setIsSliding(false), 1000);
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: -8,
        }}
      >
        <Text style={styles.monospacedText}>
          {formatTime(Math.floor(position))}
        </Text>
        <Text style={styles.monospacedText}>
          -{formatTime(Math.floor(duration) - Math.floor(position))}
        </Text>
      </View>
      <View
        style={{
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            paddingTop: isSmallScreen ? 8 : 16,
          }}
        >
          <Pressable onPress={skipToPrevious}>
            <Ionicons
              name="play-skip-back-sharp"
              size={36}
              color={colors.text}
            />
          </Pressable>
          <PlayPauseTrackButton
            size={isSmallScreen ? 40 : 60}
            type={isPlaying ? "pause" : "play"}
            onPress={togglePlayPause}
          />
          <Pressable onPress={skipToNext}>
            <Ionicons
              name="play-skip-forward-sharp"
              size={36}
              color={colors.text}
            />
          </Pressable>
        </View>
      </View>
      <BottomControlBar />
    </View>
  );
};

const styles = StyleSheet.create({
  monospacedText: {
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "Roboto",
    letterSpacing: 0.5,
  },
});
