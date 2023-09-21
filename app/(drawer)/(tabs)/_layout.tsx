import {
  HomeIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  SignalIcon,
} from "react-native-heroicons/solid";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { MiniMusicPlayer, useMusicPlayer } from "@/components";
import {
  cacheIsFirstAppLaunch,
  formatTrackListForMusicPlayer,
  getIsFirstAppLaunch,
  getRandomMusic,
} from "@/utils";
import { useAuth, useIsNavigationReady } from "@/hooks";
import { useEffect } from "react";

export default function TabLayout() {
  const pathname = usePathname();
  const { colors } = useTheme();
  const { loadTrackList, clear } = useMusicPlayer();
  const height = 88;
  const { pubkey } = useAuth();
  const router = useRouter();
  const isNavigationReady = useIsNavigationReady();

  useEffect(() => {
    if (pubkey || !isNavigationReady) {
      return;
    }

    (async () => {
      const isFirstAppLaunch = await getIsFirstAppLaunch();

      if (isFirstAppLaunch) {
        await cacheIsFirstAppLaunch();
        router.push("/auth");
      }
    })();
  }, [pubkey, isNavigationReady]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarLabelStyle: {
            fontFamily: "Poppins_700Bold",
          },
          tabBarStyle: {
            backgroundColor: colors.background,
            paddingTop: 8,
            height,
          },
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color }) => <MagnifyingGlassIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color }) => <MusicalNoteIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="radio"
          options={{
            title: "Radio",
            tabBarIcon: ({ color }) => <SignalIcon color={color} />,
          }}
          listeners={() => ({
            tabPress: async () => {
              await clear();

              const radomMusic = await getRandomMusic();

              await loadTrackList({
                trackList: formatTrackListForMusicPlayer(radomMusic),
                playerTitle: "Radio",
              });
            },
          })}
        />
      </Tabs>
      {pathname !== "/radio" && (
        <View
          style={{
            width: "100%",
            position: "absolute",
            bottom: height,
          }}
        >
          <MiniMusicPlayer />
        </View>
      )}
    </View>
  );
}
