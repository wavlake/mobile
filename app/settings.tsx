import { Button, Text, TextInput, WalletChooser } from "@/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useEffect, useState } from "react";
import { useAuth, useToast } from "@/hooks";
import {
  WalletKey,
  cacheSettings,
  deleteNwcSecret,
  getSettings,
} from "@/utils";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";
import { PlusCircleIcon, TrashIcon } from "react-native-heroicons/solid";

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { pubkey } = useAuth();
  const [defaultZapAmount, setDefaultZapAmount] = useState("");
  const [defaultZapWallet, setDefaultZapWallet] =
    useState<WalletKey>("default");
  const [allowListeningActivity, setAllowListeningActivity] = useState(false);
  const [nwcRelay, setNwcRelay] = useState("");

  const handleSave = async () => {
    Keyboard.dismiss();
    await cacheSettings(
      { defaultZapAmount, defaultZapWallet, allowListeningActivity },
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
    deleteNwcSecret(pubkey);
    cacheSettings({ nwcRelay: "" }, pubkey);
    setNwcRelay("");
  };
  const [loading, setLoading] = useState(false);
  // get settings from storage
  useEffect(() => {
    (async () => {
      setLoading(true);
      const settings = await getSettings(pubkey);
      setDefaultZapAmount(settings.defaultZapAmount ?? "");
      setDefaultZapWallet(settings.defaultZapWallet ?? "default");
      setAllowListeningActivity(settings.allowListeningActivity ?? false);
      setNwcRelay(settings.nwcRelay ?? "");
      setLoading(false);
    })();
  }, []);

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
          {pubkey && (
            <View>
              <View
                style={{
                  marginTop: 24,
                  marginBottom: 4,
                  flexDirection: "row",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text bold>Nostr Wallet Connect</Text>
                  <Text>{nwcRelay || "Add a NWC compatible wallet."}</Text>
                </View>
                {nwcRelay ? (
                  <TrashIcon
                    onPress={onDeleteNWC}
                    color={brandColors.pink.DEFAULT}
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
                />
              </View>
            </View>
          )}
        </View>
        <Button onPress={handleSave}>Save</Button>
      </View>
    </TouchableWithoutFeedback>
  );
}
