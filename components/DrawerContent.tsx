import { Alert, View } from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { Text } from "@/components/Text";
import { Divider } from "@rneui/themed";
import { brandColors } from "@/constants";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { WalletLabel } from "./WalletLabel";
import { useUser } from "./UserContextProvider";
import { useSettings } from "@/hooks/useSettings";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";

export const DrawerContent = (props: DrawerContentComponentProps) => {
  const router = useRouter();
  const { pubkey, logout } = useAuth();
  const { signOut, user, catalogUser } = useUser();
  const { data: settings } = useSettings();

  // TODO - support any nwc wallet
  // implment make_invoice on nwc server (currently using lnurl in mobile client)
  const showWallet =
    catalogUser?.isRegionVerified &&
    !catalogUser?.isLocked &&
    settings?.enableNWC;

  const showTopUp = catalogUser?.isRegionVerified && !catalogUser?.isLocked;
  const userIsLoggedIn = !!pubkey || !!catalogUser;
  return (
    <DrawerContentScrollView
      contentContainerStyle={{
        justifyContent: "space-between",
        flex: 1,
        paddingBottom: 80,
      }}
      {...props}
    >
      <View>
        {!userIsLoggedIn ? (
          <DrawerItem
            label={() => <Text style={{ fontSize: 24 }}>Login</Text>}
            icon={({ color, size }) => (
              <Ionicons name="log-in-outline" size={size} color={color} />
            )}
            onPress={() => {
              router.canDismiss() && router.dismissAll();
              router.replace("/auth");
              props.navigation.closeDrawer();
            }}
          />
        ) : (
          <DrawerItem
            label={() => <Text style={{ fontSize: 24 }}>Settings</Text>}
            icon={({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            )}
            onPress={async () => {
              router.push({ pathname: "/settings" });
              props.navigation.closeDrawer();
            }}
          />
        )}
        {/* <DrawerItem
          label={() => <Text style={{ fontSize: 24 }}>Events</Text>}
          icon={({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          )}
          onPress={async () => {
            router.push({
              pathname: "/events",
            });
            props.navigation.closeDrawer();
          }}
        /> */}
        {showWallet && (
          <DrawerItem
            label={() => <WalletLabel />}
            icon={({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            )}
            onPress={async () => {
              router.push({ pathname: "/wallet" });
              props.navigation.closeDrawer();
            }}
          />
        )}
        {showTopUp && (
          <DrawerItem
            label={() => <Text style={{ fontSize: 24 }}>Top Up</Text>}
            icon={({ color, size }) => (
              <Entypo name="sound" size={size} color={color} />
            )}
            onPress={async () => {
              router.push({ pathname: "/topup" });
              props.navigation.closeDrawer();
            }}
          />
        )}
      </View>
      <View>
        {userIsLoggedIn && (
          <View>
            <Divider
              style={{ marginHorizontal: 16 }}
              color={brandColors.black.light}
            />
            {!user && (
              <DrawerItem
                label={() => (
                  <Text style={{ fontSize: 18 }}>Link Wavlake.com</Text>
                )}
                icon={({ color, size }) => (
                  <Ionicons name="log-in-outline" size={size} color={color} />
                )}
                onPress={() => {
                  router.replace("/auth");
                  props.navigation.closeDrawer();
                }}
              />
            )}
            <DrawerItem
              label={() => <Text style={{ fontSize: 18 }}>Logout</Text>}
              icon={({ color, size }) => (
                <Ionicons name="log-out-outline" size={size} color={color} />
              )}
              onPress={() => {
                Alert.alert(
                  "Confirm logout",
                  "Wavlake does not have access to your private key (nsec) so be sure to have it backed up before logging out.",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "OK",
                      style: "destructive",
                      onPress: async () => {
                        await logout();
                        await signOut();
                        router.canDismiss() && router.dismissAll();
                        router.replace("/auth");
                        props.navigation.closeDrawer();
                      },
                    },
                  ],
                );
              }}
            />
          </View>
        )}
      </View>
    </DrawerContentScrollView>
  );
};
