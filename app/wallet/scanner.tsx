import { Button, QRScanner, satsWithCommas, Text } from "@/components";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth, useToast } from "@/hooks";
import { useSettings } from "@/hooks/useSettings";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { payWithNWC } from "@/utils";
import { BarcodeScanningResult } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";

export default function Wallet({}: {}) {
  const router = useRouter();
  // this is used to debounce the scanner so it doesnt scan multiple times
  const [scanned, setScanned] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { pubkey } = useAuth();
  const { data: settings } = useSettings();
  const toast = useToast();
  const { setBalance, refetch: refetchBalance } = useWalletBalance();
  const [invoice, setInvoice] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState(0);

  const onBarCodeScanned: (scanningResult: BarcodeScanningResult) => void = ({
    data,
  }) => {
    if (scanned === data) return;

    setScanned(data);
    processInvoice(data);
    setTimeout(() => {
      setScanned("");
    }, 3000);
  };

  const onPaste = async () => {
    const clipboard = await Clipboard.getStringAsync();
    if (clipboard) {
      await processInvoice(clipboard);
    }
  };

  const processInvoice = (invoice: string) => {
    const invoiceAmount = parseInvoice(invoice);

    if (typeof invoiceAmount === "string") {
      toast.show(invoiceAmount ?? "Invalid invoice");
      return;
    }

    setInvoiceAmount(invoiceAmount);
    setInvoice(invoice);
    setScanned("");
  };

  const payInvoice = async () => {
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
    } else {
      refetchBalance();
    }

    if (result?.preimage) {
      router.push({
        pathname: "/wallet/success",
        params: {
          amount: invoiceAmount.toString(),
          transactionType: "sent",
        },
      });
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
          {invoice ? (
            <View>
              <Text
                style={{
                  marginVertical: 40,
                  fontSize: 18,
                }}
              >
                Confirm Send
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 32,
                }}
              >
                {satsWithCommas(invoiceAmount)} sats
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 18,
                }}
              >
                {invoice.slice(0, 8)}...{invoice.slice(-8)}
              </Text>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  flexGrow: 1,
                  gap: 20,
                }}
              >
                <Button width={160} color="white" onPress={payInvoice}>
                  Pay
                </Button>
                <Button width={160} color="pink" onPress={() => router.back()}>
                  Cancel
                </Button>
              </View>
            </View>
          ) : (
            <>
              <LoadingScreen loading={isLoading} />
              <QRScanner
                onBarCodeScanned={onBarCodeScanned}
                width={"90%"}
                height={"40%"}
              />
              <Text
                style={{
                  textAlign: "center",
                  marginHorizontal: 24,
                  fontSize: 18,
                }}
              >
                Scan a Lightning invoice QR code or paste using the button below
              </Text>
              <Button width={200} color="white" onPress={onPaste}>
                Paste
              </Button>
              <Button
                style={{ marginTop: 8 }}
                width={200}
                onPress={() => router.back()}
              >
                Cancel
              </Button>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

export function parseInvoice(x: string) {
  const re = new RegExp(`(lnbc)([1234567890]{1,})(\\w)1\\w+`);
  const [zero, first, second, third] = x.match(re) || [];
  const secondInt = Number(second);
  try {
    if (!third || !second || !Number.isInteger(secondInt)) {
      throw "Invalid invoice, please ensure there is an amount specified";
    }
    switch (third) {
      case "m":
        return secondInt * 100000;
      case "u":
        return secondInt * 100;
      case "n":
        return secondInt * 0.1;
      case "p":
        return secondInt * 0.0001;
      default:
        return "Invalid invoice";
    }
  } catch (error) {
    console.log("invoiceAmount error", error);
    return error as string;
  }
}
