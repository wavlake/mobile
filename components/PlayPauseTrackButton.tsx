import React, { useEffect, useRef } from "react";
import { Pressable, Animated, View, Easing } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PlayRoundIcon } from "@/components/PlayRoundIcon";
import { PauseRoundIcon } from "@/components/PauseRoundIcon";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { AnimatedEarningRing } from "./AnimatedEarningRing";

interface PlayPauseTrackButtonProps {
  size: number;
  type: "play" | "pause";
  onPress: () => void;
  color?: string;
  isEarning?: boolean;
}

export const PlayPauseTrackButton = ({
  size,
  type,
  onPress,
  color,
  isEarning,
}: PlayPauseTrackButtonProps) => {
  const { colors } = useTheme();
  const fill = color || colors.text;
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isEarning) {
      animation = Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { iterations: -1 }, // Run indefinitely
      );
      animation.start();
    } else {
      // if (animation) {
      //   animation.stop();
      // }
      animatedValue.setValue(0);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isEarning, animatedValue]);

  return (
    <View>
      {isEarning && <AnimatedEarningRing colors={colors} size={size} />}
      <Pressable
        onPress={onPress}
        style={{
          backgroundColor: colors.background,
          borderRadius: size / 2,
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {type === "pause" && (
          <PauseRoundIcon width={size} height={size} fill={fill} />
        )}
        {type === "play" && (
          <PlayRoundIcon width={size} height={size} fill={fill} />
        )}
      </Pressable>
    </View>
  );
};
