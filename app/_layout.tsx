// https://docs.expo.dev/develop/development-builds/use-development-builds/
import "expo-dev-client";

// this is needed to polyfill crypto.subtle which nostr-tools uses
import PolyfillCrypto from "react-native-webview-crypto";

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
import { MusicPlayerProvider, Text, HeaderBackButton } from "@/components";
import { AppState, Platform, AppStateStatus, View } from "react-native";
import { RootSiblingParent } from "react-native-root-siblings";
import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
} from "react-native-track-player";
import { musicService } from "@/services";
import DeepLinkHandler from "@/components/DeepLinkHandler";
import { UserContextProvider } from "@/components/UserContextProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
    (async () => {
      try {
        TrackPlayer.registerPlaybackService(() => musicService);
      } catch (error) {
        console.log("error registering playback service", error);
      }

      await TrackPlayer.setupPlayer().catch((error) => {
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
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
      }).catch((error) => {
        console.log("error updating options", error);
      });
    })();
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
    <SafeAreaProvider>
      <ThemeProvider value={DarkTheme}>
        <QueryClientProvider client={queryClient}>
          <UserContextProvider>
            <MusicPlayerProvider>
              <RootSiblingParent>
                <View style={{ flex: 1, backgroundColor: "black" }}>
                  <PolyfillCrypto />
                  <Stack
                    screenOptions={{
                      headerStyle: {
                        backgroundColor: "black",
                      },
                      headerShadowVisible: false,
                      headerTintColor: "white",
                      headerBackTitleVisible: false,
                      headerTitleAlign: "center",
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
                      name="settings"
                      options={{
                        headerBackVisible: false,
                        headerLeft: () => <HeaderBackButton />,
                        headerTitle: () => <Text>Settings</Text>,
                      }}
                    />
                    <Stack.Screen
                      name="topup"
                      options={{
                        headerBackVisible: false,
                        headerLeft: () => <HeaderBackButton />,
                        headerTitle: () => (
                          <Text style={{ fontSize: 18 }}>Top Up</Text>
                        ),
                      }}
                    />
                    <Stack.Screen
                      name="nwcScanner"
                      options={{
                        headerTitle: () => <Text>Nostr Wallet Connect</Text>,
                      }}
                    />
                    <Stack.Screen name="notification.click" />
                    <Stack.Screen
                      name="nwcAdd"
                      options={{
                        headerTitle: () => <Text>Connecting wallet</Text>,
                      }}
                    />
                    <Stack.Screen
                      name="wallet"
                      options={{
                        headerShown: false,
                      }}
                    />
                  </Stack>
                  <DeepLinkHandler />
                </View>
              </RootSiblingParent>
            </MusicPlayerProvider>
          </UserContextProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  ) : null;
}
