import { useTheme } from "@react-navigation/native";
import { PressableIcon } from "../PressableIcon";
import { brandColors } from "@/constants";
import { useMusicPlayer } from "../MusicPlayerProvider";
import { RepeatMode } from "react-native-track-player";
import React, { ReactNode } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import { View } from "react-native";
import { Text } from "../Text";
interface RepeatButtonProps {
  size?: number;
}

const RepeatQueueIcon = ({
  size = 24,
  color,
  showNumber = false,
}: {
  size?: number;
  color: string;
  showNumber?: boolean;
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Entypo name="cycle" size={size} color={color} />
    {showNumber && (
      <View
        style={{
          borderRadius: size * 0.5,
          position: "absolute",
          width: size * 0.4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: size * 0.4,
            color,
          }}
          bold
        >
          1
        </Text>
      </View>
    )}
  </View>
);

export const RepeatButton = ({ size = 24 }: RepeatButtonProps) => {
  const { colors } = useTheme();
  const { cycleRepeatMode, repeatMode } = useMusicPlayer();

  const repeatIconMap: Record<RepeatMode, ReactNode> = {
    [RepeatMode.Off]: <RepeatQueueIcon size={size} color={colors.text} />,

    [RepeatMode.Queue]: (
      <RepeatQueueIcon size={size} color={brandColors.pink.dark} />
    ),
    [RepeatMode.Track]: (
      <RepeatQueueIcon size={size} color={brandColors.pink.dark} showNumber />
    ),
  };

  const icon = repeatIconMap[repeatMode];

  return <PressableIcon onPress={cycleRepeatMode}>{icon}</PressableIcon>;
};
