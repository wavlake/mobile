import { Drawer } from "expo-router/drawer";
import { HeaderBackButton, HeaderTitleLogo, Avatar, Text } from "@/components";
import {
  useTheme,
  DrawerActions,
  useNavigation,
} from "@react-navigation/native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { useAuth } from "@/hooks";
import { View, Pressable } from "react-native";
import { DrawerContent } from "@/components/DrawerContent";
import { VerificationIcon } from "@/components/VerificationIcon";
import { Ionicons } from "@expo/vector-icons";

const MenuButton = () => {
  const navigation = useNavigation();
  const onPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingLeft: 15,
      }}
    >
      <Ionicons name="menu-sharp" size={24} color="red" />
    </Pressable>
  );
};

export default function DrawerLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const globalSearchParams = useGlobalSearchParams();
  const { pubkey } = useAuth();
  const headerTitle =
    typeof globalSearchParams.headerTitle === "string"
      ? () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              flex: 1,
            }}
          >
            <Text numberOfLines={1}>{globalSearchParams.headerTitle}</Text>
            {globalSearchParams.includeHeaderTitleVerifiedBadge === "1" && (
              <VerificationIcon width={24} height={24} fill={colors.text} />
            )}
          </View>
        )
      : HeaderTitleLogo;
  const headerLeft =
    globalSearchParams.includeBackButton === "true"
      ? () => <HeaderBackButton />
      : () => <MenuButton />;

  const headerRight = () => {
    if (!pubkey) {
      return null;
    }

    return (
      <View style={{ marginRight: 16 }}>
        <Pressable
          hitSlop={20}
          onPress={() => {
            router.push({
              pathname: `/profile/profile/${pubkey}`,
              params: { includeBackButton: "true" },
            });
          }}
        >
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
        headerTitleAlign: "center",
        headerTintColor: colors.text,
        drawerLabelStyle: { color: colors.text },
        drawerStatusBarAnimation: "none",
        swipeEdgeWidth: 0,
        drawerIcon: () => {
          const onPress = () => {
            console.log("open drawer");
          };
          return <MenuButton onPress={onPress} />;
        },
      }}
      drawerContent={DrawerContent}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
