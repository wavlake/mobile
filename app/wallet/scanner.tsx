import { Button, QRScanner, Text } from "@/components";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth, useToast } from "@/hooks";
import { useSettings } from "@/hooks/useSettings";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { payWithNWC } from "@/utils";
import { BarCodeScannedCallback } from "expo-barcode-scanner";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Wallet({}: {}) {
  const router = useRouter();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { pubkey } = useAuth();
  const { data: settings } = useSettings();
  const toast = useToast();
  const { setBalance } = useWalletBalance();
  const onBarCodeScanned: BarCodeScannedCallback = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    console.log(data);
    await processInvoice(data);
    setScanned(false);
  };

  const onPaste = async () => {
    const clipboard = await Clipboard.toString();
    if (clipboard) {
      await processInvoice(clipboard);
    }
  };

  const processInvoice = async (invoice: string) => {
    if (!settings?.nwcPubkey || !settings?.nwcRelay) {
      toast.show("Wallet has not been setup");
      return;
    }

    setIsLoading(true);
    // use NWC, responds with preimage if successful
    const response = await payWithNWC({
      userPubkey: pubkey,
      invoice,
      walletPubkey: settings.nwcPubkey,
      nwcRelay: settings.nwcRelay,
    });

    const { error, result, result_type } = response;
    if (result_type !== "pay_invoice") {
      toast.show("Something went wrong. Please try again later.");
      return;
    }

    if (error?.message) {
      const errorMsg = `${error.code ?? "Error"}: ${error.message}`;
      toast.show(errorMsg);
    }

    if (result?.balance) {
      setBalance(result.balance);
    }

    if (result?.preimage) {
      // invoice was paid, we have the preimage
      toast.show("Payment sent");
      router.back();
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: 24,
            gap: 12,
          }}
        >
          <LoadingScreen loading={isLoading} />
          <Text
            style={{
              marginVertical: 40,
              fontSize: 24,
            }}
          >
            Send
          </Text>
          <QRScanner
            onBarCodeScanned={onBarCodeScanned}
            width={"90%"}
            height={"40%"}
          />
          <Text
            style={{
              textAlign: "center",
              marginHorizontal: 24,
              fontSize: 14,
            }}
          >
            Scan a Lightning invoice QR code or paste using the button below
          </Text>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              flexGrow: 1,
              gap: 20,
            }}
          >
            <Button width={160} color="white" onPress={onPaste}>
              Paste
            </Button>
            <Button width={160} color="pink" onPress={() => router.back()}>
              Cancel
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
