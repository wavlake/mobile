import { Drawer } from "expo-router/drawer";
import { HeaderBackButton, HeaderTitleLogo, Avatar, Text } from "@/components";
import { useTheme } from "@react-navigation/native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { useAuth } from "@/hooks";
import { View, Pressable } from "react-native";
import { DrawerContent } from "@/components/DrawerContent";
import { VerificationIcon } from "@/components/VerificationIcon";

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
      : undefined;
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
      }}
      drawerContent={DrawerContent}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}
