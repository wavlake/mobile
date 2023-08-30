import {
  HomeIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  SignalIcon,
} from "react-native-heroicons/solid";
import { Tabs } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { HeaderTitleLogo, MiniMusicPlayer, useMusicPlayer } from "@/components";
import { formatMusicItemForMusicPlayer, getRandomMusic } from "@/utils";

export default function TabLayout() {
  const { colors } = useTheme();
  const { loadItemList, isPlaying } = useMusicPlayer();
  const height = 88;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerTitle: HeaderTitleLogo,
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
            headerShown: false,
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
            headerShown: false,
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
              if (!isPlaying) {
                const radomMusic = await getRandomMusic();

                await loadItemList({
                  itemList: formatMusicItemForMusicPlayer(radomMusic),
                  playerTitle: "Radio",
                });
              }
            },
          })}
        />
      </Tabs>
      <View
        style={{
          width: "100%",
          position: "absolute",
          bottom: height,
        }}
      >
        <MiniMusicPlayer />
      </View>
    </View>
  );
}
