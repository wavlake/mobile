import { Button, Text, TextInput, WalletChooser } from "@/components";
import { useRouter, useFocusEffect } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useCallback, useState } from "react";
import { useAuth, useToast } from "@/hooks";
import {
  WalletKey,
  cacheSettings,
  deleteNwcSecret,
  getSettings,
  payInvoiceCommand,
  fetchingCommands,
} from "@/utils";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";
import {
  CheckCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "react-native-heroicons/solid";

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { pubkey } = useAuth();
  const [defaultZapAmount, setDefaultZapAmount] = useState("");
  const [defaultZapWallet, setDefaultZapWallet] =
    useState<WalletKey>("default");
  const [allowListeningActivity, setAllowListeningActivity] = useState(false);
  const [nwcRelay, setNwcRelay] = useState("");
  const [enableNWC, setEnableNWC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenActive, setScreenActive] = useState(true);
  const [nwcCommands, setNwcCommands] = useState<string[]>([]);

  const handleSave = async () => {
    Keyboard.dismiss();
    await cacheSettings(
      { defaultZapAmount, defaultZapWallet, allowListeningActivity, enableNWC },
      pubkey,
    );

    toast.show("saved");
  };
  const onAddNWC = () => {
    router.push({
      pathname: "/nwcScanner",
    });
  };

  const onDeleteNWC = () => {
    pubkey && deleteNwcSecret(pubkey);
    cacheSettings(
      {
        nwcRelay: undefined,
        nwcCommands: [],
        nwcPubkey: undefined,
        nwcLud16: undefined,
        enableNWC: false,
      },
      pubkey,
    );
    setNwcRelay("");
  };

  const [loadingCommands, setLoadingCommands] = useState(false);
  const fetchSettings = useCallback(() => {
    setScreenActive(true);
    (async () => {
      setLoading(true);
      const settings = await getSettings(pubkey);
      setDefaultZapAmount(settings.defaultZapAmount ?? "");
      setDefaultZapWallet(settings.defaultZapWallet ?? "default");
      setAllowListeningActivity(settings.allowListeningActivity ?? false);
      setNwcRelay(settings.nwcRelay ?? "");
      setEnableNWC(settings.enableNWC ?? false);
      setNwcCommands(settings.nwcCommands ?? []);
      setLoading(false);

      setLoadingCommands(nwcCommands.includes(fetchingCommands));
    })();
    return () => {
      setScreenActive(false);
    };
  }, [screenActive]);

  // fetch settings on mount
  useFocusEffect(fetchSettings);

  // if a new wallet was just added, fetch settings again after a couple seconds
  // this allows for the NWC commands to be fetched and cached

  if (loading) return;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ padding: 24, gap: 24, alignItems: "center" }}>
        <View style={{ marginBottom: 24, width: "100%" }}>
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
            nwcRelay={nwcRelay}
            enableNWC={enableNWC}
            setEnableNWC={setEnableNWC}
            onDeleteNWC={onDeleteNWC}
            onAddNWC={onAddNWC}
            nwcCommands={nwcCommands}
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
        </View>
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
  const loadingCommands = nwcCommands.includes(fetchingCommands);
  const nwcCantPayInvoices =
    !!nwcRelay && !nwcCommands.includes(payInvoiceCommand) && !loadingCommands;

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
