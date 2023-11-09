import { Button, Text, TextInput } from "@/components";
import { useRouter } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import { useAuth, useToast } from "@/hooks";
import { cacheSettings, saveNwcSecret } from "@/utils";
import { BarCodeScannedCallback, BarCodeScanner } from "expo-barcode-scanner";
import { validateNwcURI } from "@/utils/nwc";

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { pubkey } = useAuth();
  const [scanned, setScanned] = useState(false);
  const [newNwcURI, setNewNwcURI] = useState("");

  const onBarCodeScanned: BarCodeScannedCallback = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    handleSaveNewNwcURI(data);

    setScanned(false);
  };
  const handleSaveNewNwcURI = async (uri: string) => {
    const {
      isValid,
      relay,
      secret,
      lud16,
      pubkey: nwcPubkey,
    } = validateNwcURI(uri);

    if (!isValid || !secret) {
      toast.show("Invalid NWC");
      return;
    }

    await saveNwcSecret(secret, pubkey);
    await cacheSettings(
      { nwcRelay: relay, nwcLud16: lud16, nwcPubkey },
      pubkey,
    );
    // our job is finished here, head back to where the user came from
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <TextInput
          label="Pairing secret"
          value={newNwcURI}
          onChangeText={setNewNwcURI}
          secureTextEntry={true}
        />
        <Button
          style={{ paddingBottom: 14 }}
          onPress={() => handleSaveNewNwcURI(newNwcURI)}
        >
          Save Secret
        </Button>
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
    </TouchableWithoutFeedback>
  );
}
