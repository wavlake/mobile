import { Drawer } from "expo-router/drawer";
import { HeaderBackButton, HeaderTitleLogo, Text } from "@/components";
import {
  useTheme,
  DrawerActions,
  useNavigation,
} from "@react-navigation/native";
import { useRouter, useGlobalSearchParams, usePathname } from "expo-router";
import { useAuth, useUser } from "@/hooks";
import { View, Pressable, Alert } from "react-native";
import { DrawerContent } from "@/components/DrawerContent";
import { VerificationIcon } from "@/components/VerificationIcon";
import { Ionicons } from "@expo/vector-icons";
import { LoggedInUserAvatar } from "@/components/LoggedInUserAvatar";

const MenuButton = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const onPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={20}
      style={{
        paddingLeft: 15,
        position: "relative",
      }}
    >
      <Ionicons name="menu-sharp" size={24} color={colors.text} />
    </Pressable>
  );
};

export default function DrawerLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const globalSearchParams = useGlobalSearchParams();
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
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
    if (!pubkey && !catalogUser) {
      return null;
    }
    return (
      <View style={{ marginRight: 16 }}>
        <Pressable
          hitSlop={20}
          onPress={
            pubkey
              ? () => {
                  // if the user is already on their profile page, don't let the user navigate to it again
                  if (pathname === `/profile/profile/${pubkey}`) {
                    return;
                  }

                  router.push({
                    pathname: `/profile/profile/${pubkey}`,
                    params: { includeBackButton: "true" },
                  });
                }
              : () =>
                  Alert.alert(
                    "Nostr account required",
                    "You must login to nostr to view your profile page.",
                    [
                      {
                        text: "Login to nostr",
                        onPress: () => {
                          router.push("/settings");
                          router.push("/settings/advanced");
                          router.push("/settings/nsec");
                        },
                      },
                      { text: "Cancel", style: "cancel" },
                    ],
                  )
          }
        >
          <LoggedInUserAvatar size={24} />
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
      }}
      drawerContent={DrawerContent}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
