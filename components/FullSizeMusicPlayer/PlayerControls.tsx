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
import { Text } from "@/components/Text";
import { useEffect, useState } from "react";
import { PlayPauseTrackButton } from "@/components/PlayPauseTrackButton";
import {
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";

interface PlayerControlsProps {
  isSmallScreen: boolean;
  color?: string;
  isEarning?: boolean;
}

export const PlayerControls = ({
  isSmallScreen,
  color,
  isEarning,
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

  return (
    <View style={{ paddingVertical: isSmallScreen ? 0 : 24 }}>
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          paddingTop: isSmallScreen ? 8 : 16,
        }}
      >
        <Pressable onPress={skipToPrevious}>
          <Ionicons name="play-skip-back-sharp" size={36} color={colors.text} />
        </Pressable>
        <PlayPauseTrackButton
          size={isSmallScreen ? 40 : 60}
          type={playbackState === State.Paused ? "play" : "pause"}
          onPress={togglePlayPause}
          isEarning={isEarning}
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
  );
};

const styles = StyleSheet.create({
  monospacedText: {
    fontFamily: Platform.OS === "ios" ? "Helvetica" : "Roboto",
    letterSpacing: 0.5,
  },
});
