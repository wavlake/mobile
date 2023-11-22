import { Button, Text, TextInput, WalletChooser } from "@/components";
import { useRouter } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import { useAuth, useToast } from "@/hooks";
import {
  WalletKey,
  cacheSettings,
  deleteNwcSecret,
  payInvoiceCommand,
} from "@/utils";
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
import { ScrollView } from "react-native-gesture-handler";

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { pubkey } = useAuth();
  const { data: settings } = useSettings();
  const [defaultZapAmount, setDefaultZapAmount] = useState(
    settings?.defaultZapAmount ?? "",
  );
  const [defaultZapWallet, setDefaultZapWallet] = useState<WalletKey>(
    settings?.defaultZapWallet ?? "default",
  );
  const [allowListeningActivity, setAllowListeningActivity] = useState(
    settings?.allowListeningActivity ?? false,
  );
  const [enableNWC, setEnableNWC] = useState(settings?.enableNWC ?? false);
  const [oneTapZap, setOneTapZap] = useState(settings?.oneTapZap ?? false);

  const queryClient = useQueryClient();
  const settingsKey = useSettingsQueryKey();

  const handleSave = async () => {
    Keyboard.dismiss();
    await cacheSettings(
      {
        defaultZapAmount,
        defaultZapWallet,
        allowListeningActivity,
        enableNWC,
        oneTapZap,
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

  if (!settings) return;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ padding: 24, gap: 24, alignItems: "center" }}>
        <ScrollView style={{ marginBottom: 24, width: "100%" }}>
          <TextInput
            label="Default zap amount"
            value={defaultZapAmount}
            keyboardType="numeric"
            onChangeText={setDefaultZapAmount}
          />
          <WalletChooser
            selectedWallet={defaultZapWallet}
            onSelectedWalletChange={setDefaultZapWallet}
          />
          <NWCSettings
            nwcRelay={settings.nwcRelay}
            enableNWC={enableNWC}
            setEnableNWC={setEnableNWC}
            onDeleteNWC={onDeleteNWC}
            onAddNWC={onAddNWC}
            nwcCommands={settings.nwcCommands}
          />
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
                Broadcast tracks you are listening to as a live status event to
                Nostr relays.
              </Text>
            </View>
            <Switch
              value={allowListeningActivity}
              onValueChange={setAllowListeningActivity}
              color={brandColors.pink.DEFAULT}
            />
          </View>
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
            />
          </View>
        </ScrollView>
        <Button onPress={handleSave}>Save</Button>
      </View>
    </TouchableWithoutFeedback>
  );
}

const NWCSettings = ({
  nwcRelay,
  enableNWC,
  setEnableNWC,
  onDeleteNWC,
  onAddNWC,
  nwcCommands,
}: {
  nwcRelay: string;
  enableNWC: boolean;
  setEnableNWC: (enable: boolean) => void;
  onDeleteNWC: () => void;
  onAddNWC: () => void;
  nwcCommands: string[];
}) => {
  const nwcCantPayInvoices =
    !!nwcRelay && !nwcCommands.includes(payInvoiceCommand);

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
            {nwcRelay && <CheckCircleIcon color={brandColors.mint.DEFAULT} />}
            <Text>{nwcRelay || "Add a NWC compatible wallet."}</Text>
          </View>
        </View>
        {nwcRelay ? (
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
      {nwcRelay && (
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
              {enableNWC
                ? "Disable to use a different wallet for zaps."
                : "Enable to use NWC wallet for zaps."}
            </Text>
          </View>
          <Switch
            value={enableNWC}
            onValueChange={setEnableNWC}
            color={brandColors.pink.DEFAULT}
            disabled={nwcCantPayInvoices}
          />
        </View>
      )}
    </View>
  );
};
