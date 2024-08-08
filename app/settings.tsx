import { Text, TextInput, WalletChooser } from "@/components";
import { useRouter } from "expo-router";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ScrollView,
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
import { useUser } from "@/components/UserContextProvider";
import { BUILD_NUM, VERSION } from "@/app.config";

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { pubkey, userIsLoggedIn } = useAuth();
  const { catalogUser } = useUser();
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
  const [enableWavlakeWallet, setEnableWavlakeWallet] = useState(
    settings?.enableWavlakeWallet ?? false,
  );
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
        enableWavlakeWallet,
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
      publishKind1 !== settings.publishKind1 ||
      enableWavlakeWallet !== settings.enableWavlakeWallet
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
    enableWavlakeWallet,
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
          {catalogUser?.isRegionVerified && (
            <View
              style={{
                marginBottom: 24,
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text bold>Use Wavlake Wallet</Text>
                <Text>
                  {enableWavlakeWallet
                    ? "Disable to use a different wallet."
                    : "Enable to use your wavlake wallet."}
                </Text>
              </View>
              <Switch
                value={enableWavlakeWallet}
                onValueChange={setEnableWavlakeWallet}
                color={brandColors.pink.DEFAULT}
                trackColor={{
                  false: colors.border,
                  true: brandColors.pink.DEFAULT,
                }}
                thumbColor={colors.text}
              />
            </View>
          )}
          <WalletChooser
            selectedWallet={defaultZapWallet}
            onSelectedWalletChange={setDefaultZapWallet}
            enabled={!enableWavlakeWallet}
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
