import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { HeaderTitleLogo } from "@/components";

export default function HomeLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: "white",
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: HeaderTitleLogo }} />
      <Stack.Screen
        name="music/discover"
        options={{ headerTitle: "New music" }}
      />
    </Stack>
  );
}
