import { Text, WalletChooser } from "@/components";
import { useRouter } from "expo-router";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  useAuth,
  useToast,
  useSettingsManager,
  WAVLAKE_RELAY,
  useUser,
  useDeleteUser,
} from "@/hooks";
import { Settings, payInvoiceCommand } from "@/utils";
import { useTheme } from "@react-navigation/native";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";
import {
  CheckCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "react-native-heroicons/solid";
import { useQueryClient } from "@tanstack/react-query";

const SettingsSwitch = ({
  value,
  onValueChange,
  disabled,
  description,
  title,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  description: string;
  title: string;
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text bold>{title}</Text>
        <Text>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        color={brandColors.pink.DEFAULT}
        trackColor={{
          false: colors.border,
          true: brandColors.pink.DEFAULT,
        }}
        thumbColor={colors.text}
      />
    </View>
  );
};

function getDomainFromWebSocket(wsAddress?: string) {
  if (!wsAddress) return "NWC";
  // Use a regular expression to match the domain
  const match = wsAddress.match(/^wss?:\/\/([^/:]+)/i);
  // Return the matched domain or null if no match
  return match ? match[1] : "NWC";
}

const NWCSettings = ({
  settings,
  onUpdateSettings,
}: {
  settings: Settings;
  onUpdateSettings: (settings: Partial<Settings>) => Promise<void>;
}) => {
  const router = useRouter();
  const nwcCantPayInvoices =
    !!settings?.nwcRelay && !settings?.nwcCommands?.includes(payInvoiceCommand);

  const handleDeleteNWC = () => {
    Alert.alert(
      "Are you sure you want to delete this connection?",
      `You will no longer be able to send zaps with your ${getDomainFromWebSocket(
        settings?.nwcRelay,
      )} wallet. You will need to re-connect to use it again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Connection",
          style: "destructive",
          onPress: async () => {
            await onUpdateSettings({
              nwcRelay: undefined,
              nwcCommands: [],
              nwcPubkey: undefined,
              nwcLud16: undefined,
              enableNWC: false,
            });
          },
        },
      ],
    );
  };

  if (!settings) return null;

  return (
    <View style={styles.nwcContainer}>
      <View style={styles.nwcHeader}>
        <View style={styles.nwcInfo}>
          <Text bold>Nostr Wallet Connect (NWC)</Text>
          <View style={styles.nwcStatus}>
            {settings.nwcRelay && (
              <CheckCircleIcon color={brandColors.mint.DEFAULT} />
            )}
            <Text>{settings.nwcRelay || "Add a NWC compatible wallet."}</Text>
          </View>
        </View>
        {settings.nwcRelay ? (
          <TrashIcon
            onPress={handleDeleteNWC}
            color={brandColors.orange.DEFAULT}
            height={40}
            width={40}
            hitSlop={styles.iconHitSlop}
          />
        ) : (
          <PlusCircleIcon
            onPress={() => router.push({ pathname: "/nwcScanner" })}
            color={brandColors.pink.DEFAULT}
            height={40}
            width={40}
            hitSlop={styles.iconHitSlop}
          />
        )}
      </View>
      {nwcCantPayInvoices && (
        <Text style={styles.errorText}>
          It looks like this wallet cannot pay invoices, please try another
          wallet connection.
        </Text>
      )}
      {settings.nwcRelay && (
        <SettingsSwitch
          value={settings.enableNWC || false}
          onValueChange={(value) => onUpdateSettings({ enableNWC: value })}
          disabled={nwcCantPayInvoices}
          title="Enable NWC Wallet"
          description={
            settings.enableNWC
              ? "Disable to use a different wallet."
              : "Enable to use NWC wallet."
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  sectionTitle: {
    fontSize: 20,
    width: "100%",
    textAlign: "left",
  },
  settingRow: {
    flexDirection: "row",
    width: "100%",
  },
  settingText: {
    flex: 1,
  },
  nwcContainer: {
    width: "100%",
    gap: 16,
  },
  nwcHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  nwcInfo: {
    flex: 1,
  },
  nwcStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  errorText: {
    color: brandColors.orange.DEFAULT,
  },
  iconHitSlop: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },
});

export default function AdvancedSettingsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const router = useRouter();
  const { userIsLoggedIn: pubkeyLoggedIn } = useAuth();
  const { settings, updateSettings } = useSettingsManager();
  const { catalogUser } = useUser();

  const handleSettingsUpdate = async (newSettings: Partial<Settings>) => {
    try {
      toast.clearAll();
      Keyboard.dismiss();
      await updateSettings(newSettings);
      toast.show("saved");
    } catch (error) {
      toast.show("Failed to save settings");
      console.error("Failed to save settings:", error);
    }
  };

  const { mutateAsync: deleteUser } = useDeleteUser();
  const handleClearCachedData = async () => {
    queryClient.clear();
    toast.show("Cleared cache");
  };

  const handleDeleteUser = async () => {
    try {
      const { success } = await deleteUser();
      if (success) {
        router.canDismiss() && router.dismissAll();
        router.replace("/auth");
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast.show("Failed to delete user, please contact suppport@wavlake.com");
      console.error("Failed to delete user:", error);
    }
  };

  if (!settings) return null;

  const userIsLoggedIn = !!catalogUser || pubkeyLoggedIn;
  const hasWavlakeWallet =
    catalogUser?.isRegionVerified &&
    !catalogUser?.isLocked &&
    settings?.enableNWC &&
    settings.nwcRelay === WAVLAKE_RELAY;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Wallet</Text>
        <WalletChooser
          selectedWallet={settings.defaultZapWallet ?? "default"}
          onSelectedWalletChange={(wallet) => {
            handleSettingsUpdate({ defaultZapWallet: wallet });
          }}
        />
        {userIsLoggedIn && (
          <NWCSettings
            settings={settings}
            onUpdateSettings={handleSettingsUpdate}
          />
        )}
        {pubkeyLoggedIn && (
          <SettingsSwitch
            value={settings.allowListeningActivity ?? false}
            onValueChange={(value) =>
              handleSettingsUpdate({ allowListeningActivity: value })
            }
            title="Listening activity"
            description="Broadcast tracks you are listening to as a live status event to Nostr relays."
          />
        )}
        <SettingsSwitch
          value={settings.oneTapZap ?? false}
          onValueChange={(value) => handleSettingsUpdate({ oneTapZap: value })}
          title="One tap zaps"
          description="Change the default behavior of the zap button to one tap zap your default amount. Long press to open the comment form."
        />
        {hasWavlakeWallet && (
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <TouchableOpacity
                hitSlop={20}
                onPress={() => router.push({ pathname: "/settings/nwc" })}
              >
                <Text bold>Update Wallet Limits</Text>
                <Text>
                  Tap here to edit your Wavlake wallet budgets and limits.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <Text style={styles.sectionTitle}>Nostr</Text>
        {pubkeyLoggedIn && (
          <SettingsSwitch
            value={settings.publishKind1 ?? false}
            onValueChange={(value) =>
              handleSettingsUpdate({ publishKind1: value })
            }
            title="Publish comments to nostr"
            description="Publish comments to your nostr feed. These comments will show up in other nostr clients as kind 1 events."
          />
        )}
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <TouchableOpacity
              hitSlop={20}
              onPress={() => router.push({ pathname: "/settings/nsec" })}
            >
              <Text bold>Export or update your nostr secret key</Text>
              <Text>
                Tap here to view your account secret key and export it to a safe
                place.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingText}>
            <TouchableOpacity
              hitSlop={20}
              onPress={() => {
                Alert.alert(
                  "Are you sure?",
                  "This action is irreversible and will delete any cached data on your device.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear cache",
                      style: "destructive",
                      onPress: handleClearCachedData,
                    },
                  ],
                );
              }}
            >
              <Text bold>Clear app cache</Text>
              <Text>This will delete cached data on your device.</Text>
            </TouchableOpacity>
          </View>
        </View>
        {!!catalogUser && (
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <TouchableOpacity
                hitSlop={20}
                onPress={() => {
                  Alert.alert(
                    "Are you sure you want to delete your account and logout?",
                    "This action is irreversible and will delete your account and all associated data.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete Account",
                        style: "destructive",
                        onPress: handleDeleteUser,
                      },
                    ],
                  );
                }}
              >
                <Text bold>Delete user account</Text>
                <Text>
                  This will delete your user account and you will no longer be
                  able to login.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
