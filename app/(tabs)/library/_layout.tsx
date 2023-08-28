import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { HeaderTitleLogo } from "@/components";

export default function LibraryLayout() {
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
      <Stack.Screen name="music/artists" options={{ headerTitle: "Artists" }} />
      <Stack.Screen name="music/albums" options={{ headerTitle: "Albums" }} />
      <Stack.Screen name="music/songs" options={{ headerTitle: "Songs" }} />
      <Stack.Screen
        name="music/playlists"
        options={{ headerTitle: "Playlists" }}
      />
    </Stack>
  );
}
