import { Button, QRScanner, Text, TextInput } from "@/components";
import { CopyButton } from "@/components/CopyButton";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth, useToast } from "@/hooks";
import { useSettings } from "@/hooks/useSettings";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { getNWCInvoice, payWithNWC } from "@/utils";
import { BarCodeScannedCallback } from "expo-barcode-scanner";
import { isLoading } from "expo-font";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function Wallet({}: {}) {
  const router = useRouter();
  const { pubkey } = useAuth();
  const { data: settings } = useSettings();
  const toast = useToast();
  const [invoice, setInvoice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [isEnteringAmount, setIsEnteringAmount] = useState(true);

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
          <Text
            style={{
              fontSize: 24,
              flexGrow: 1,
            }}
          >
            Receive
          </Text>
          {isEnteringAmount ? (
            <>
              <TextInput
                keyboardType="numeric"
                label="Amount (optional)"
                value={amount}
                onChangeText={setAmount}
              />
              <Button
                width={200}
                color="white"
                loading={isLoading}
                onPress={async () => {
                  if (!settings?.nwcPubkey || !settings?.nwcRelay) {
                    toast.show("Wallet has not been setup");
                    return;
                  }

                  if (Number(amount) >= 0) {
                    setIsLoading(true);
                    const invoice = await getNWCInvoice({
                      amount: Number(amount),
                      userPubkey: pubkey,
                      walletPubkey: settings?.nwcPubkey,
                      nwcRelay: settings?.nwcRelay,
                    });
                    setInvoice("1234567890");
                    setIsEnteringAmount(false);
                    setIsLoading(false);
                  } else {
                    toast.show("Amount must be a positive number");
                  }
                }}
              >
                Create Invoice
              </Button>
            </>
          ) : (
            <>
              <QRCode value={invoice} ecl="H" size={250} quietZone={10} />
              <Text
                style={{
                  textAlign: "center",
                  marginHorizontal: 24,
                  fontSize: 14,
                }}
              >
                Invoice
              </Text>
              <View
                style={{
                  marginHorizontal: 24,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    padding: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 14,
                      color: "black",
                    }}
                  >
                    {invoice.slice(0, 10)}...{invoice.slice(-10)}
                  </Text>
                </View>
                <CopyButton value={invoice} />
              </View>
            </>
          )}

          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              flexGrow: 1,
              gap: 20,
            }}
          >
            <Button width={160} color="pink" onPress={() => router.back()}>
              Cancel
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
