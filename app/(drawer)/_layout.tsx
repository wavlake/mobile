import { Drawer } from "expo-router/drawer";
import { HeaderBackButton, HeaderTitleLogo, Text } from "@/components";
import { useTheme } from "@react-navigation/native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";

export default function DrawerLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const globalSearchParams = useGlobalSearchParams();
  const headerTitle =
    typeof globalSearchParams.headerTitle === "string"
      ? globalSearchParams.headerTitle
      : HeaderTitleLogo;
  const headerLeft = globalSearchParams.includeBackButton
    ? () => <HeaderBackButton />
    : undefined;

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTitle,
        headerLeft,
        headerTintColor: colors.text,
        drawerLabelStyle: { color: colors.text },
        drawerStatusBarAnimation: "none",
        swipeEdgeWidth: 0,
      }}
      drawerContent={(props) => {
        return (
          <DrawerContentScrollView {...props}>
            <DrawerItem
              label={() => <Text style={{ fontSize: 24 }}>Login</Text>}
              onPress={() => {
                router.push("/login");
                props.navigation.closeDrawer();
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
