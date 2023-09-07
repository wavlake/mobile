import { useEffect } from "react";
import { Stack, SplashScreen } from "expo-router";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { MusicPlayerProvider } from "@/components";
import { AppState, Platform, AppStateStatus } from "react-native";

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function Layout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 2000);
    }
  }, [loaded]);

  const onAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS !== "web") {
      focusManager.setFocused(status === "active");
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => subscription.remove();
  }, []);

  return loaded ? (
    <ThemeProvider value={DarkTheme}>
      <QueryClientProvider client={queryClient}>
        <MusicPlayerProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "black",
              },
              headerShadowVisible: false,
              headerTintColor: "white",
              headerBackTitleVisible: false,
            }}
          >
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth"
              options={{ headerShown: false, presentation: "fullScreenModal" }}
            />
          </Stack>
        </MusicPlayerProvider>
      </QueryClientProvider>
    </ThemeProvider>
  ) : null;
}
