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
import { useBalance } from "@/hooks/useBalance";

export const DrawerContent = (props: DrawerContentComponentProps) => {
  const router = useRouter();
  const { pubkey, logout } = useAuth();
  const { balance } = useBalance();
  console.log("drawer content", balance);
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
        {!pubkey && (
          <DrawerItem
            label={() => <Text style={{ fontSize: 24 }}>Login</Text>}
            icon={({ color, size }) => (
              <Ionicons name="log-in-outline" size={size} color={color} />
            )}
            onPress={() => {
              router.push("/auth");
              props.navigation.closeDrawer();
            }}
          />
        )}
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
      </View>
      {pubkey && (
        <View>
          <Divider
            style={{ marginHorizontal: 16 }}
            color={brandColors.black.light}
          />
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
                      props.navigation.closeDrawer();
                    },
                  },
                ],
              );
            }}
          />
        </View>
      )}

      <Text>{balance?.toString()} sats</Text>
    </DrawerContentScrollView>
  );
};
