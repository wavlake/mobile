import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Text } from "@/components";

export default function ZapLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="scanner"
        options={{
          headerShown: false,
          presentation: "containedModal",
        }}
      />
      <Stack.Screen
        name="receive"
        options={{
          headerShown: false,
          presentation: "containedModal",
        }}
      />
    </Stack>
  );
}
