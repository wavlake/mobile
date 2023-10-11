import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Text } from "@/components";

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
        headerTitle: () => <Text>Zap</Text>,
      }}
    >
      <Stack.Screen
        name="success"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
