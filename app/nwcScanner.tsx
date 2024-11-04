import { Button, QRScanner, Text, TextInput } from "@/components";
import { useRouter } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import { useAuth, useSettingsManager, useToast, useUser } from "@/hooks";
import { BarcodeScanningResult } from "expo-camera";

import { intakeNwcURI } from "@/utils/nwc";
import LoadingScreen from "@/components/LoadingScreen";

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { pubkey } = useAuth();
  const [scanned, setScanned] = useState(false);
  const [newNwcURI, setNewNwcURI] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refetch: refetchSettings } = useSettingsManager();
  const { catalogUser } = useUser();
  const userIdOrPubkey = catalogUser?.id ?? pubkey;

  const onBarCodeScanned: (
    scanningResult: BarcodeScanningResult,
  ) => void = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    await handleSaveNewNwcURI(data);
    setScanned(false);
  };

  const handleSaveNewNwcURI = async (uri: string) => {
    setIsLoading(true);
    const { isSuccess, error, fetchInfo } = await intakeNwcURI({
      uri,
      userIdOrPubkey,
    });
    if (isSuccess) {
      await refetchSettings();
      router.back();
      // fetch the info event and refresh settings after
      await fetchInfo?.();
      await refetchSettings();
    } else {
      error && toast.show(error);
    }
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
