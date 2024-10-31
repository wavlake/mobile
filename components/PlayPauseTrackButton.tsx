import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PauseRoundIcon, PlayRoundIcon } from "./icons";

interface PlayPauseTrackButtonProps {
  size: number;
  type: "play" | "pause";
  onPress: () => void;
  color?: string;
}

export const PlayPauseTrackButton = ({
  size,
  type,
  onPress,
  color,
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
