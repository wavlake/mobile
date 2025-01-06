import { Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ReactNode } from "react";
import { Text } from "./shared/Text";

interface PressableIconProps {
  onPress: () => void;
  text?: ReactNode;
  numberOfLines?: number;
  icon?: ReactNode;
}

export const PressableDialogRow = ({
  onPress,
  text,
  numberOfLines = 1,
  icon,
}: PressableIconProps) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 50,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: pressed ? colors.card : colors.background,
      })}
    >
      {text && (
        <Text
          style={{
            fontSize: 20,
          }}
          numberOfLines={numberOfLines}
          bold
        >
          {text}
        </Text>
      )}
      {icon}
    </Pressable>
  );
};
