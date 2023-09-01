import { Drawer } from "expo-router/drawer";
import { HeaderTitleLogo, Text } from "@/components";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";

export default function DrawerLayout() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTitle: HeaderTitleLogo,
        headerTintColor: colors.text,
        drawerLabelStyle: { color: colors.text },
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
