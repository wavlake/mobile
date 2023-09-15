import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";

export default function ZapLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitle: "Zap",
      }}
    />
  );
}
