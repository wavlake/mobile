import {
  HomeIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  SignalIcon,
} from "react-native-heroicons/solid";
import { Tabs, usePathname } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { MiniMusicPlayer, useMusicPlayer } from "@/components";
import { formatMusicItemForMusicPlayer, getRandomMusic } from "@/utils";

export default function TabLayout() {
  const pathname = usePathname();
  const { colors } = useTheme();
  const { loadItemList, clear } = useMusicPlayer();
  const height = 88;

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
          name="index"
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

              await loadItemList({
                itemList: formatMusicItemForMusicPlayer(radomMusic),
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
