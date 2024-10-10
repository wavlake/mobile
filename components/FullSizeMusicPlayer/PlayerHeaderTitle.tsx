import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useMusicPlayer } from "../MusicPlayerProvider";
import { Text } from "@/components";
import { usePromoCheck } from "@/hooks";
import { State, usePlaybackState } from "react-native-track-player";
import { brandColors } from "@/constants";

const TopUpGreen = "#15f38c";

// Helper function to darken a hex color
const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return `#${(
    (1 << 24) |
    ((R < 255 ? (R < 1 ? 0 : R) : 255) << 16) |
    ((G < 255 ? (G < 1 ? 0 : G) : 255) << 8) |
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};

export const PlayerHeaderTitle = () => {
  const { activeTrack, playerTitle } = useMusicPlayer();
  const { state: playbackState } = usePlaybackState();
  const promoCheckResult = usePromoCheck(
    activeTrack?.hasPromo && activeTrack.id,
  );

  const {
    promoUser: { canEarnToday, earnedToday, earnableToday },
  } = promoCheckResult?.data || {
    promoUser: {},
  };

  const isPlaying = playbackState === State.Playing;
  const showEarnings =
    typeof earnedToday === "number" && typeof earnableToday === "number";

  // Animation setup
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying && canEarnToday) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isPlaying, canEarnToday, pulseAnim]);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      TopUpGreen,
      darkenColor(TopUpGreen, 20), // Darken TopUpGreen by 20%
    ],
  });

  if (!showEarnings) {
    return <Text>{playerTitle}</Text>;
  }

  return (
    <Animated.View
      style={{
        borderRadius: 20,
        backgroundColor:
          isPlaying && canEarnToday ? backgroundColor : brandColors.beige.dark,
        padding: 6,
        width: 200,
      }}
    >
      <Text
        style={{
          width: "100%",
          textAlign: "center",
          color: "black",
        }}
      >{`Top Up (${earnedToday / 1000}/${earnableToday / 1000} sats)`}</Text>
    </Animated.View>
  );
};
