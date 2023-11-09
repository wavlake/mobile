import { Button, Text, TextInput, WalletChooser } from "@/components";
import { useLocalSearchParams } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useEffect, useState } from "react";
import { useAuth, useToast } from "@/hooks";
import { cacheSettings, deleteNwcURI, getNwcURI, saveNwcURI } from "@/utils";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";
import {
  PlusCircleIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "react-native-heroicons/solid";
import { BarCodeScannedCallback, BarCodeScanner } from "expo-barcode-scanner";

export default function SettingsPage() {
  const toast = useToast();
  const { pubkey } = useAuth();
  const params = useLocalSearchParams();
  const settings = JSON.parse(params.settings as string);
  const [defaultZapAmount, setDefaultZapAmount] = useState(
    settings.defaultZapAmount ?? "",
  );
  const [defaultZapWallet, setDefaultZapWallet] = useState(
    settings.defaultZapWallet ?? "default",
  );
  const [allowListeningActivity, setAllowListeningActivity] = useState(
    settings.allowListeningActivity ?? false,
  );
  const handleSave = async () => {
    Keyboard.dismiss();
    await cacheSettings(
      { defaultZapAmount, defaultZapWallet, allowListeningActivity },
      pubkey,
    );

    toast.show("saved");
  };
  const [showScanner, setShowScanner] = useState(false);
  const onAddNWC = () => {
    setShowScanner(true);
  };

  const onDeleteNWC = () => {
    deleteNwcURI();
    setNwcURI("");
  };
  const [scanned, setScanned] = useState(false);

  const onBarCodeScanned: BarCodeScannedCallback = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    saveNwcURI(data);
    setShowScanner(false);
    setScanned(false);
  };

  const handleSaveNWC = () => {
    saveNwcURI(newNwcURI);
    setNwcURI("");
    setShowScanner(false);
  };

  const [nwcURI, setNwcURI] = useState("");
  const [newNwcURI, setNewNwcURI] = useState("");

  useEffect(() => {
    (async () => {
      const storedNwcUri = await getNwcURI();

      if (storedNwcUri) {
        setNwcURI(storedNwcUri);
      }
    })();
  }, [showScanner]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      {showScanner ? (
        <View
          style={{
            gap: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextInput
            label="Nostr Wallet Connect pairing secret"
            value={newNwcURI}
            onChangeText={setNewNwcURI}
            secureTextEntry={true}
          />
          <Button onPress={handleSaveNWC}>Save</Button>
          <Text>Scan a NWC QR code or paste one above</Text>
          <BarCodeScanner
            onBarCodeScanned={onBarCodeScanned}
            style={{
              width: "90%",
              height: "70%",
              borderColor: "white",
              borderWidth: 1,
            }}
          />
        </View>
      ) : (
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
                    <Text>{nwcURI || "Add a NWC compatible wallet."}</Text>
                  </View>
                  {nwcURI ? (
                    <TrashIcon
                      onPress={onDeleteNWC}
                      color={brandColors.pink.DEFAULT}
                      height={40}
                      width={40}
                    />
                  ) : (
                    <PlusCircleIcon
                      onPress={onAddNWC}
                      color={brandColors.pink.DEFAULT}
                      height={40}
                      width={40}
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
                      Broadcast tracks you are listening to as a live status
                      event to Nostr relays.
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
      )}
    </TouchableWithoutFeedback>
  );
}
