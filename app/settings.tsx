import { Text, TextInput, WalletChooser } from "@/components";
import { useRouter } from "expo-router";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth, useToast } from "@/hooks";
import {
  WalletKey,
  cacheSettings,
  deleteNwcSecret,
  payInvoiceCommand,
} from "@/utils";
import { useTheme } from "@react-navigation/native";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";
import {
  CheckCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "react-native-heroicons/solid";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/useSettings";
import { useSettingsQueryKey } from "@/hooks/useSettingsQueryKey";
import { BUILD_NUM, VERSION } from "@/app.config";

function getDomainFromWebSocket(wsAddress?: string) {
  if (!wsAddress) return "NWC";
  // Use a regular expression to match the domain
  const match = wsAddress.match(/^wss?:\/\/([^/:]+)/i);

  // Return the matched domain or null if no match
  return match ? match[1] : "NWC";
}

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { pubkey, userIsLoggedIn } = useAuth();
  const { colors } = useTheme();

  const { data: settings } = useSettings();
  const [defaultZapAmount, setDefaultZapAmount] = useState(
    settings?.defaultZapAmount ?? "",
  );
  const [isFocusedOnZapAmount, setIsFocusedOnZapAmount] = useState(false);
  const [defaultZapWallet, setDefaultZapWallet] = useState<WalletKey>(
    settings?.defaultZapWallet ?? "default",
  );
  const [allowListeningActivity, setAllowListeningActivity] = useState(
    settings?.allowListeningActivity ?? false,
  );
  const [enableNWC, setEnableNWC] = useState(settings?.enableNWC ?? false);

  const [oneTapZap, setOneTapZap] = useState(settings?.oneTapZap ?? false);
  const [publishKind1, setPublishKind1] = useState(
    settings?.publishKind1 ?? false,
  );

  const queryClient = useQueryClient();
  const settingsKey = useSettingsQueryKey();

  const handleSave = async () => {
    toast.clearAll();
    Keyboard.dismiss();
    await cacheSettings(
      {
        defaultZapAmount,
        defaultZapWallet,
        allowListeningActivity,
        enableNWC,
        oneTapZap,
        publishKind1,
      },
      pubkey,
    );
    queryClient.invalidateQueries(settingsKey);
    toast.show("saved");
  };
  const onAddNWC = () => {
    router.push({
      pathname: "/nwcScanner",
    });
  };

  const onDeleteNWC = async () => {
    Alert.alert(
      "Are you sure you want to delete this connection?",
      `You will no longer be able to send zaps with your ${getDomainFromWebSocket(
        settings?.nwcRelay,
      )} wallet. You will need to re-connect to use it again.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Connection",
          style: "destructive",
          onPress: async () => {
            pubkey && deleteNwcSecret(pubkey);
            await cacheSettings(
              {
                nwcRelay: undefined,
                nwcCommands: [],
                nwcPubkey: undefined,
                nwcLud16: undefined,
                enableNWC: false,
              },
              pubkey,
            );
            queryClient.invalidateQueries(settingsKey);
          },
        },
      ],
    );
  };

  // autosave settings on change
  useEffect(() => {
    if (!settings || isFocusedOnZapAmount) return;
    if (
      defaultZapAmount !== settings.defaultZapAmount ||
      defaultZapWallet !== settings.defaultZapWallet ||
      allowListeningActivity !== settings.allowListeningActivity ||
      enableNWC !== settings.enableNWC ||
      oneTapZap !== settings.oneTapZap ||
      publishKind1 !== settings.publishKind1
    ) {
      handleSave();
    }
  }, [
    isFocusedOnZapAmount,
    defaultZapWallet,
    allowListeningActivity,
    enableNWC,
    oneTapZap,
    publishKind1,
  ]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          alignItems: "center",
        }}
      >
        <View style={{ marginBottom: 24, width: "100%" }}>
          <TextInput
            onFocus={() => setIsFocusedOnZapAmount(true)}
            onBlur={() => setIsFocusedOnZapAmount(false)}
            label="Default zap amount"
            value={defaultZapAmount}
            keyboardType="numeric"
            onChangeText={setDefaultZapAmount}
          />
          <WalletChooser
            selectedWallet={defaultZapWallet}
            onSelectedWalletChange={setDefaultZapWallet}
          />
          {userIsLoggedIn && (
            <NWCSettings
              setEnableNWC={setEnableNWC}
              onDeleteNWC={onDeleteNWC}
              onAddNWC={onAddNWC}
            />
          )}
          {userIsLoggedIn && (
            <View
              style={{
                marginTop: 24,
                marginBottom: 4,
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text bold>Listening activity</Text>
                <Text>
                  Broadcast tracks you are listening to as a live status event
                  to Nostr relays.
                </Text>
              </View>
              <Switch
                value={allowListeningActivity}
                onValueChange={setAllowListeningActivity}
                color={brandColors.pink.DEFAULT}
                trackColor={{
                  false: colors.border,
                  true: brandColors.pink.DEFAULT,
                }}
                thumbColor={colors.text}
              />
            </View>
          )}
          <View
            style={{
              marginTop: 24,
              marginBottom: 4,
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text bold>One tap zaps</Text>
              <Text>
                Change the default behavior of the zap button to one tap zap
                your default amount. Long press to open the comment form.
              </Text>
            </View>
            <Switch
              value={oneTapZap}
              onValueChange={setOneTapZap}
              color={brandColors.pink.DEFAULT}
              trackColor={{
                false: colors.border,
                true: brandColors.pink.DEFAULT,
              }}
              thumbColor={colors.text}
            />
          </View>
          {userIsLoggedIn && (
            <View
              style={{
                marginTop: 24,
                marginBottom: 4,
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text bold>Publish comments to nostr</Text>
                <Text>
                  Publish comments to your nostr feed. These comments will show
                  up in other nostr clients as kind 1 events.
                </Text>
              </View>
              <Switch
                value={publishKind1}
                onValueChange={setPublishKind1}
                color={brandColors.pink.DEFAULT}
                trackColor={{
                  false: colors.border,
                  true: brandColors.pink.DEFAULT,
                }}
                thumbColor={colors.text}
              />
            </View>
          )}
        </View>
        <View style={{ flex: 1, alignSelf: "flex-start", marginBottom: 4 }}>
          <Text bold>Version information</Text>
          <Text>
            {VERSION} ({BUILD_NUM})
          </Text>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const NWCSettings = ({
  setEnableNWC,
  onDeleteNWC,
  onAddNWC,
}: {
  setEnableNWC: (enable: boolean) => void;
  onDeleteNWC: () => void;
  onAddNWC: () => void;
}) => {
  const { data: settings } = useSettings();

  const { colors } = useTheme();
  const nwcCantPayInvoices =
    !!settings?.nwcRelay && !settings?.nwcCommands.includes(payInvoiceCommand);

  return (
    <View>
      <View
        style={{
          marginTop: 24,
          marginBottom: 4,
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text bold>Nostr Wallet Connect (NWC)</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            {settings?.nwcRelay && (
              <CheckCircleIcon color={brandColors.mint.DEFAULT} />
            )}
            <Text>{settings?.nwcRelay || "Add a NWC compatible wallet."}</Text>
          </View>
        </View>
        {settings?.nwcRelay ? (
          <TrashIcon
            onPress={onDeleteNWC}
            color={brandColors.orange.DEFAULT}
            height={40}
            width={40}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        ) : (
          <PlusCircleIcon
            onPress={onAddNWC}
            color={brandColors.pink.DEFAULT}
            height={40}
            width={40}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          />
        )}
      </View>
      {nwcCantPayInvoices && (
        <Text>
          It looks like this wallet cannot pay invoices, please try another
          wallet connection.
        </Text>
      )}
      {settings?.nwcRelay && (
        <View
          style={{
            marginTop: 24,
            marginBottom: 4,
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text bold>Enable NWC Wallet</Text>
            <Text>
              {settings?.enableNWC
                ? "Disable to use a different wallet."
                : "Enable to use NWC wallet."}
            </Text>
          </View>
          <Switch
            value={settings?.enableNWC}
            onValueChange={setEnableNWC}
            disabled={nwcCantPayInvoices}
            color={brandColors.pink.DEFAULT}
            trackColor={{
              false: colors.border,
              true: brandColors.pink.DEFAULT,
            }}
            thumbColor={colors.text}
          />
        </View>
      )}
    </View>
  );
};
