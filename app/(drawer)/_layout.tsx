import { Drawer } from "expo-router/drawer";
import { HeaderBackButton, HeaderTitleLogo, Text, Avatar } from "@/components";
import { useTheme } from "@react-navigation/native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useAuth } from "@/hooks";
import { View, Pressable } from "react-native";

export default function DrawerLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const globalSearchParams = useGlobalSearchParams();
  const { pubkey, logout } = useAuth();
  const headerTitle =
    typeof globalSearchParams.headerTitle === "string"
      ? globalSearchParams.headerTitle
      : HeaderTitleLogo;
  const headerLeft = globalSearchParams.includeBackButton
    ? () => <HeaderBackButton />
    : undefined;
  const headerRight = () => {
    if (!pubkey) {
      return null;
    }

    return (
      <View style={{ marginRight: 16 }}>
        <Pressable onPress={() => router.push("/profile")}>
          <Avatar size={24} />
        </Pressable>
      </View>
    );
  };

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTitle,
        headerLeft,
        headerRight,
        headerTintColor: colors.text,
        drawerLabelStyle: { color: colors.text },
        drawerStatusBarAnimation: "none",
        swipeEdgeWidth: 0,
      }}
      drawerContent={(props) => {
        return (
          <DrawerContentScrollView {...props}>
            <DrawerItem
              label={() => (
                <Text style={{ fontSize: 24 }}>
                  {pubkey ? "Logout" : "Login"}
                </Text>
              )}
              onPress={async () => {
                if (pubkey) {
                  await logout();
                } else {
                  router.push("/auth");
                  props.navigation.closeDrawer();
                }
              }}
            />
          </DrawerContentScrollView>
        );
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
