import { Pressable, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PropsWithChildren, ReactNode } from "react";
import { Text } from "./shared/Text";

interface PressableIconProps {
  onPress?: () => void;
  fullWidth?: boolean;
  size?: number;
  label?: ReactNode;
  color?: string;
}

export const PressableIcon = ({
  onPress,
  fullWidth = false,
  size = 40,
  label,
  children,
  color,
}: PropsWithChildren<PressableIconProps>) => {
  const { colors } = useTheme();

  if (!onPress) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: label ? "space-between" : "center",
          width: fullWidth ? "100%" : size,
          height: size,
        }}
      >
        {label && typeof label === "string" ? (
          <Text style={{ color: color ?? colors.text }}>{label}</Text>
        ) : (
          label
        )}
        {children}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: label ? "space-between" : "center",
        width: fullWidth ? "100%" : size,
        height: size,
      }}
    >
      {label && typeof label === "string" ? (
        <Text style={{ color: color ?? colors.text }}>{label}</Text>
      ) : (
        label
      )}
      {children}
    </Pressable>
  );
};
