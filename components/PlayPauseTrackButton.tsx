import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PlayRoundIcon } from "@/components/PlayRoundIcon";
import { PauseRoundIcon } from "@/components/PauseRoundIcon";
import { AnimatedEarningRing } from "./AnimatedEarningRing";

interface PlayPauseTrackButtonProps {
  size: number;
  type: "play" | "pause";
  onPress: () => void;
  color?: string;
  isEarning: boolean;
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

  return (
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
      {isEarning && <AnimatedEarningRing colors={colors} size={size} />}
      <View>
        {type === "pause" && (
          <PauseRoundIcon width={size} height={size} fill={fill} />
        )}
        {type === "play" && (
          <PlayRoundIcon width={size} height={size} fill={fill} />
        )}
      </View>
    </Pressable>
  );
};
