import { Button, Text, TextInput } from "@/components";
import { useRouter } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useEffect, useState } from "react";
import { useAuth, useToast } from "@/hooks";
import { cacheSettings, saveNwcSecret } from "@/utils";
import { BarCodeScannedCallback, BarCodeScanner } from "expo-barcode-scanner";
import { getWalletServiceCommands, validateNwcURI } from "@/utils/nwc";
import LoadingScreen from "@/components/LoadingScreen";

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { pubkey } = useAuth();
  const [scanned, setScanned] = useState(false);
  const [newNwcURI, setNewNwcURI] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onBarCodeScanned: BarCodeScannedCallback = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    await handleSaveNewNwcURI(data);
    setScanned(false);
  };
  const handleSaveNewNwcURI = async (uri: string) => {
    // settings page (used to reach this scanner) is only accessible to logged in users
    // but useAuth returns { pubkey: string | undefined }
    if (!pubkey) {
      console.error("no pubkey found");
      return;
    }

    const {
      isValid,
      relay,
      secret,
      lud16,
      pubkey: nwcPubkey,
    } = validateNwcURI(uri);

    if (!isValid || !secret) {
      toast.show("invalid NWC");
      return;
    }

    setIsLoading(true);
    await saveNwcSecret(secret, pubkey);

    const nwcCommands = await getWalletServiceCommands(nwcPubkey, relay);
    await cacheSettings(
      {
        nwcRelay: relay,
        nwcLud16: lud16,
        nwcPubkey,
        enableNWC: true,
        nwcCommands,
      },
      pubkey,
    );

    setIsLoading(false);
    // send the user back to where they came from
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
        <LoadingScreen loading={isLoading} />
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
        <QRScanner onBarCodeScanned={onBarCodeScanned} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const QRScanner = ({
  onBarCodeScanned,
}: {
  onBarCodeScanned: BarCodeScannedCallback;
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  if (hasPermission === undefined) {
    return <Text>Requesting camera permissions</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <BarCodeScanner
      onBarCodeScanned={onBarCodeScanned}
      style={{
        width: "90%",
        height: "70%",
        borderColor: "white",
        borderWidth: 1,
      }}
    />
  );
};
