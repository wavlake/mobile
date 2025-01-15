import { Alert, AlertButton, View } from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { Text } from "./shared/Text";
import { Divider } from "@rneui/themed";
import { brandColors } from "@/constants";
import { useAuth, useInbox, useUser, WAVLAKE_RELAY } from "@/hooks";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { WalletLabel } from "./WalletLabel";
import { useSettings } from "@/hooks/useSettings";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Feather from "@expo/vector-icons/Feather";

export const DrawerContent = (props: DrawerContentComponentProps) => {
  const router = useRouter();
  const { pubkey, logout } = useAuth();
  const { signOut, catalogUser } = useUser();
  const { data: settings } = useSettings();
  const { hasUnreadMessages } = useInbox();

  // TODO - support any nwc wallet
  // implment make_invoice on nwc server (currently using lnurl in mobile client)
  const showWallet =
    catalogUser?.isRegionVerified &&
    !catalogUser?.isLocked &&
    settings?.enableNWC &&
    settings.nwcRelay === WAVLAKE_RELAY;

  const showEarn = catalogUser?.isRegionVerified && !catalogUser?.isLocked;
  const showSettings = pubkey || catalogUser;
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
        {!catalogUser && (
          <>
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
          </>
        )}
        {!pubkey && (
          <DrawerItem
            label={() => <Text style={{ fontSize: 24 }}>Connect Nostr</Text>}
            icon={({ color, size }) => (
              <Ionicons name="log-in-outline" size={size} color={color} />
            )}
            onPress={async () => {
              router.push("/nsec");
              props.navigation.closeDrawer();
            }}
          />
        )}
        {showSettings && (
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
        {pubkey && (
          <DrawerItem
            label={() => <Text style={{ fontSize: 24 }}>Inbox</Text>}
            icon={({ color, size }) => (
              <View style={{ position: "relative", width: size, height: size }}>
                <Feather name="inbox" size={size} color={color} />
                {hasUnreadMessages && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: brandColors.pink.DEFAULT,
                    }}
                  />
                )}
              </View>
            )}
            onPress={async () => {
              router.push({
                pathname: `/inbox`,
                params: { includeBackButton: "true" },
              });
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
        {showEarn && (
          <DrawerItem
            label={() => <Text style={{ fontSize: 24 }}>Earn</Text>}
            icon={({ color, size }) => (
              <FontAwesome5 name="coins" size={size} color={color} />
            )}
            onPress={async () => {
              router.push({ pathname: "/earn" });
              props.navigation.closeDrawer();
            }}
          />
        )}
      </View>
      <View>
        {catalogUser && (
          <View>
            <Divider
              style={{ marginHorizontal: 16 }}
              color={brandColors.black.light}
            />
            {/* {!user && (
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
            )} */}
            {catalogUser && (
              <DrawerItem
                label={() => <Text style={{ fontSize: 18 }}>Logout</Text>}
                icon={({ color, size }) => (
                  <Ionicons name="log-out-outline" size={size} color={color} />
                )}
                onPress={() => {
                  const nsecBackupButton: AlertButton = {
                    text: "Backup Key",
                    style: "default",
                    onPress: async () => {
                      router.push("/settings");
                      router.push("/settings/advanced");
                      router.push("/settings/nsec");
                      props.navigation.closeDrawer();
                    },
                  };

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
                      ...(pubkey ? [nsecBackupButton] : []),
                    ],
                  );
                }}
              />
            )}
          </View>
        )}
      </View>
    </DrawerContentScrollView>
  );
};
