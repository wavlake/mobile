import { Button, Text, TextInput } from "@/components";
import { useRouter } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useEffect, useState } from "react";
import { useAuth, useToast } from "@/hooks";
import { BarCodeScannedCallback, BarCodeScanner } from "expo-barcode-scanner";
import { intakeNwcURI } from "@/utils/nwc";
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
    setIsLoading(true);
    await intakeNwcURI({
      uri,
      pubkey,
      onSucess: () => router.back(),
      onError: (error: string) => toast.show(error),
    });
    setIsLoading(false);
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
