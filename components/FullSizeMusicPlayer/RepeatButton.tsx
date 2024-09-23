import { useTheme } from "@react-navigation/native";
import { PressableIcon } from "../PressableIcon";
import { brandColors } from "@/constants";
import { useMusicPlayer } from "../MusicPlayerProvider";
import { RepeatMode } from "react-native-track-player";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";

interface RepeatButtonProps {
  size?: number;
}

const repeatIconMap: Record<RepeatMode, keyof typeof MaterialIcons.glyphMap> = {
  [RepeatMode.Off]: "repeat",
  [RepeatMode.Queue]: "repeat",
  [RepeatMode.Track]: "repeat-one",
};

export const RepeatButton = ({ size = 24 }: RepeatButtonProps) => {
  const { colors } = useTheme();
  const { cycleRepeatMode, repeatMode } = useMusicPlayer();

  const iconName = repeatIconMap[repeatMode];
  const iconColor =
    repeatMode === RepeatMode.Off ? colors.text : brandColors.pink.DEFAULT;
  return (
    <PressableIcon onPress={cycleRepeatMode}>
      <MaterialIcons name={iconName} size={size} color={iconColor} />
    </PressableIcon>
  );
};
