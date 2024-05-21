import {
  HomeIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  SignalIcon,
} from "react-native-heroicons/solid";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import {
  MiniMusicPlayer,
  useMusicPlayer,
  MiniMusicPlayerProvider,
} from "@/components";
import {
  cacheIsFirstAppLaunch,
  getIsFirstAppLaunch,
  getRandomMusic,
} from "@/utils";
import { useAuth, useIsNavigationReady } from "@/hooks";
import { useEffect } from "react";
import { useUser } from "@/components/UserContextProvider";
import { Octicons } from "@expo/vector-icons";

export default function TabLayout() {
  const pathname = usePathname();
  const { colors } = useTheme();
  const { loadTrackList, reset } = useMusicPlayer();
  const tabsBarHeight = 88;
  const { logout } = useAuth();
  const { signOut } = useUser();
  const router = useRouter();
  const isNavigationReady = useIsNavigationReady();

  useEffect(() => {
    if (!isNavigationReady) {
      return;
    }

    (async () => {
      const isFirstAppLaunch = await getIsFirstAppLaunch();
      if (isFirstAppLaunch) {
        await cacheIsFirstAppLaunch();

        // make sure to delete stored private key if any on first app launch.
        await logout();
        // ensure user is logged out of firebase
        await signOut();

        await router.push("/auth");
      }
    })();
  }, [logout, isNavigationReady]);

  return (
    <MiniMusicPlayerProvider>
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
              height: tabsBarHeight,
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
            name="pulse"
            options={{
              title: "Pulse",
              tabBarIcon: ({ color }) => (
                <Octicons name="pulse" size={24} color={color} />
              ),
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
            name="events"
            options={{
              // this hides the tab from showing in the tab bar
              href: null,
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
                await reset();
                await loadTrackList({
                  trackList: await getRandomMusic(),
                  trackListId: "radio",
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
              bottom: tabsBarHeight,
            }}
          >
            <MiniMusicPlayer />
          </View>
        )}
      </View>
    </MiniMusicPlayerProvider>
  );
}
