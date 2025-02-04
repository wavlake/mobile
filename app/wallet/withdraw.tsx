import {
  Button,
  msatsToSatsWithCommas,
  QRScanner,
  satsWithCommas,
  Text,
} from "@/components";
import LoadingScreen from "@/components/LoadingScreen";
import { useAuth, useToast, useUser } from "@/hooks";
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
import { parseInvoice } from "@/utils/bolt11";

export default function Withdraw({}: {}) {
  const router = useRouter();
  // this is used to debounce the scanner so it doesnt scan multiple times
  const [scanned, setScanned] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const userIdOrPubkey = catalogUser?.id ?? pubkey;
  const { data: settings } = useSettings();
  const toast = useToast();
  const {
    setBalance,
    refetch: refetchBalance,
    data: balanceData,
  } = useWalletBalance();
  const { balance } = balanceData ?? { balance: 0 };
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

    invoiceAmount && setInvoiceAmount(invoiceAmount);
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
      userIdOrPubkey,
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
      router.replace({
        pathname: "/wallet/success",
        params: {
          amount: invoiceAmount.toString(),
          transactionType: "sent",
        },
      });
    }
    setIsLoading(false);
  };
  // the wavlake wallet will reject payment (insufficient balance) if it does not account for an addtl 1.5% in fees
  const invoiceTooHigh = invoiceAmount > 0.985 * balance;
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
              {invoiceTooHigh && (
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 18,
                    color: "red",
                  }}
                >
                  Warning: This withdrawal amount is higher than the maximum
                  withdrawal amount of{" "}
                  {msatsToSatsWithCommas(Math.floor(balance * 0.985))} sats.
                  Please reduce the invoice amount to account for 1.5% in
                  potential network fees.
                </Text>
              )}
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
              <Text
                style={{
                  textAlign: "center",
                  marginHorizontal: 24,
                  fontSize: 18,
                }}
              >
                The withdrawal amount must account for at least 1.5% in
                additional Lightning Network fees. Pleaes limit the withdrawal
                to {msatsToSatsWithCommas(Math.floor(balance * 0.985))} sats.
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
