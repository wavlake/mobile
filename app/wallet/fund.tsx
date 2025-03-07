import { Button, OrSeparator, Text, TextInput } from "@/components";
import { CopyButton } from "@/components/CopyButton";
import { useAuth, useToast, useUser } from "@/hooks";
import { useSettings } from "@/hooks/useSettings";
import { listenForIncomingNWCPayment } from "@/utils";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export const buildUri = (
  baseUri: string,
  params: Record<string, string | undefined>,
) => {
  const url = new URL(baseUri);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, encodeURIComponent(value));
    }
  });
  return url.toString();
};

export default function Fund({}: {}) {
  const router = useRouter();
  const { catalogUser } = useUser();
  const { data: settings } = useSettings();
  const { pubkey } = useAuth();
  const userIdOrPubkey = catalogUser?.id ?? pubkey;
  const toast = useToast();
  const [invoice, setInvoice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [isEnteringAmount, setIsEnteringAmount] = useState(true);
  const isMounted = useRef(true);
  const lightningAddress = catalogUser?.profileUrl
    ? `${catalogUser?.profileUrl}@wavlake.com`
    : undefined;

  useEffect(() => {
    // Set isMounted to true when the component mounts
    isMounted.current = true;

    // Cleanup function to run when the component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  // fetch invoice from lnurl
  const fetchInvoice = async () => {
    if (!catalogUser?.profileUrl) {
      toast.show("Error fetching invoice: missing profile url");
      return null;
    }

    try {
      const amountMsats = Number(amount) * 1000;
      const url = buildUri(
        `https://wavlake.com/api/lnurlp/${catalogUser.profileUrl}`,
        {
          amount: amountMsats.toString(),
        },
      );

      const response = await fetch(url);

      if (!response.ok) {
        // Handle HTTP error status
        const errorData = await response.json();
        toast.show(`Error: ${errorData?.reason || "Failed to fetch invoice"}`);
        return null;
      }

      const data = await response.json();

      // Check for LUD-06 error format
      if (data.status === "ERROR") {
        toast.show(`Error: ${data.reason || "Unknown error"}`);
        return null;
      }

      // Check for missing PR in successful response
      if (!data?.pr) {
        toast.show("Error: Invoice data missing from response");
        return null;
      }

      return data.pr;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.show("Error fetching invoice: network or server issue");
      return null;
    }
  };

  useEffect(() => {
    if (!invoice) return;
    if (!settings?.nwcPubkey || !settings?.nwcRelay) {
      toast.show("Wallet has not been setup");
      return;
    }

    let abortController = new AbortController();
    listenForIncomingNWCPayment({
      userIdOrPubkey,
      invoice,
      walletPubkey: settings?.nwcPubkey,
      nwcRelay: settings?.nwcRelay,
      signal: abortController.signal,
    })
      .then(() => {
        if (isMounted.current) {
          router.replace({
            pathname: "/wallet/success",
            params: {
              amount: amount.toString(),
              transactionType: "received",
            },
          });
        }
      })
      .catch((error) => {
        if (isMounted.current && error.name !== "AbortError") {
          toast.show(error);
        }
      });
    return () => {
      abortController.abort(); // Abort the ongoing operation when component unmounts
    };
  }, [invoice]);

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
          {isEnteringAmount ? (
            <>
              {lightningAddress && (
                <>
                  <Text
                    style={{
                      textAlign: "center",
                      marginHorizontal: 24,
                      fontSize: 18,
                    }}
                  >
                    Send funds to your lightning address:
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      marginHorizontal: 24,
                      fontSize: 18,
                    }}
                  >
                    {lightningAddress}
                  </Text>
                  <OrSeparator />
                </>
              )}
              <TextInput
                keyboardType="numeric"
                label="Amount"
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
                    const invoice = await fetchInvoice();
                    invoice && setInvoice(invoice);
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
                  fontSize: 18,
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
                      fontSize: 18,
                      color: "black",
                    }}
                  >
                    {invoice.slice(0, 8)}...{invoice.slice(-8)}
                  </Text>
                </View>
                <CopyButton value={invoice} />
              </View>
            </>
          )}
          <Button
            style={{ marginTop: 8 }}
            width={200}
            onPress={() => router.back()}
          >
            Cancel
          </Button>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
