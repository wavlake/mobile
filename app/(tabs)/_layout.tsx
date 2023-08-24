import {
  HomeIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  SignalIcon,
} from "react-native-heroicons/solid";
import { Tabs } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { MiniMusicPlayer } from "../../components";

export default function TabLayout() {
  const { colors } = useTheme();

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
            height: 88,
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
        />
      </Tabs>
      <View
        style={{
          width: "100%",
          position: "absolute",
          bottom: 88,
        }}
      >
        <MiniMusicPlayer />
      </View>
    </View>
  );
}
