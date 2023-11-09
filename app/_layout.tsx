// https://docs.expo.dev/develop/development-builds/use-development-builds/
import "expo-dev-client";

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
import { MusicPlayerProvider, Text } from "@/components";
import { AppState, Platform, AppStateStatus, View } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings";
import TrackPlayer, { Capability } from "react-native-track-player";
import { musicService } from "@/services";

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

  useEffect(() => {
    try {
      TrackPlayer.registerPlaybackService(() => musicService);
    } catch (error) {
      console.log("error registering playback service", error);
    }

    TrackPlayer.setupPlayer().catch((error) => {
      console.log("error setting up player", error);
    });

    TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
    }).catch((error) => {
      console.log("error updating options", error);
    });
  }, []);

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
          <RootSiblingParent>
            <View style={{ flex: 1, backgroundColor: "black" }}>
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
                <Stack.Screen
                  name="(drawer)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="auth"
                  options={{
                    headerShown: false,
                    gestureEnabled: false,
                    gestureDirection: "vertical",
                  }}
                />
                <Stack.Screen
                  name="zap"
                  options={{
                    headerShown: false,
                    gestureEnabled: false,
                    gestureDirection: "vertical",
                  }}
                />
                <Stack.Screen
                  name="profile"
                  options={{ headerTitle: () => <Text>Profile</Text> }}
                />
                <Stack.Screen
                  name="settings"
                  options={{ headerTitle: () => <Text>Settings</Text> }}
                />
                <Stack.Screen
                  name="nwcScanner"
                  options={{
                    headerTitle: () => <Text>Nostr Wallet Connect</Text>,
                  }}
                />
              </Stack>
            </View>
          </RootSiblingParent>
        </MusicPlayerProvider>
      </QueryClientProvider>
    </ThemeProvider>
  ) : null;
}
