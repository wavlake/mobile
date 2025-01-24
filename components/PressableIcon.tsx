import { Pressable, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PropsWithChildren, ReactNode } from "react";
import { Text } from "./shared/Text";

interface PressableIconProps {
  onPress?: () => void;
  onLongPress?: () => void;
  fullWidth?: boolean;
  size?: number;
  leftLabel?: ReactNode;
  rightLabel?: ReactNode;
  color?: string;
}

export const PressableIcon = ({
  onPress,
  onLongPress,
  fullWidth = false,
  size = 40,
  leftLabel,
  rightLabel,
  children,
  color,
}: PropsWithChildren<PressableIconProps>) => {
  if (!onPress && !onLongPress) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: leftLabel ? "space-between" : "center",
          width: fullWidth ? "100%" : size,
          height: size,
        }}
      >
        {leftLabel && typeof leftLabel === "string" ? (
          <TextLabel color={color} label={leftLabel} />
        ) : (
          leftLabel
        )}
        {children}
        {rightLabel && typeof rightLabel === "string" ? (
          <TextLabel color={color} label={rightLabel} />
        ) : (
          rightLabel
        )}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      hitSlop={10}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: leftLabel ? "space-between" : "center",
        width: fullWidth ? "100%" : size,
        height: size,
        gap: 2,
      }}
    >
      {leftLabel && typeof leftLabel === "string" ? (
        <TextLabel color={color} label={leftLabel} />
      ) : (
        leftLabel
      )}
      {children}
      {rightLabel && typeof rightLabel === "string" ? (
        <TextLabel color={color} label={rightLabel} />
      ) : (
        rightLabel
      )}
    </Pressable>
  );
};

const TextLabel = ({ color, label }: { color?: string; label: string }) => {
  const { colors } = useTheme();

  return <Text style={{ color: color ?? colors.text }}>{label}</Text>;
};
