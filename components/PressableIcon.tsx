import { Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PropsWithChildren, ReactNode } from "react";
import { Text } from "@/components/Text";

interface PressableIconProps {
  onPress: () => void;
  size?: number;
  label?: ReactNode;
}

export const PressableIcon = ({
  onPress,
  size = 40,
  label,
  children,
}: PropsWithChildren<PressableIconProps>) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderRadius: size / 2,
        width: size,
        height: size,
      }}
    >
      {label && typeof label === "string" ? (
        <Text style={{ color: colors.text }}>{label}</Text>
      ) : (
        label
      )}
      {children}
    </Pressable>
  );
};
