import {
  MarqueeText,
  TrackArtwork,
  CancelButton,
  Button,
  TextInput,
  Center,
  WalletChooserModal,
} from "@/components";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth, useNostrRelayList, useToast } from "@/hooks";
import {
  cacheDefaultZapWallet,
  fetchInvoice,
  getDefaultZapWallet,
  getZapReceipt,
  openInvoiceInWallet,
  validateWalletKey,
} from "@/utils";

export default function ZapPage() {
  const router = useRouter();
  const toast = useToast();
  const { pubkey } = useAuth();
  const { defaultZapAmount, title, artist, artworkUrl, trackId } =
    useLocalSearchParams<{
      defaultZapAmount: string;
      title: string;
      artist: string;
      artworkUrl: string;
      trackId: string;
    }>();

  const [isWalletChooserModalVisible, setIsWalletChooserModalVisible] =
    useState(false);
  const [zapAmount, setZapAmount] = useState(defaultZapAmount as string);
  const [isZapping, setIsZapping] = useState(false);
  const [comment, setComment] = useState("");
  const isZapDisabled =
    zapAmount.length === 0 || Number(zapAmount) <= 0 || isZapping;
  const { writeRelayList } = useNostrRelayList();
  const handleZap = async () => {
    const defaultZapWallet = await getDefaultZapWallet(pubkey);

    if (!validateWalletKey(defaultZapWallet)) {
      setIsWalletChooserModalVisible(true);
      return;
    }

    setIsZapping(true);

    const wavlakeTrackKind = 32123;
    const wavlakePubkey =
      "7759fb24cec56fc57550754ca8f6d2c60183da2537c8f38108fdf283b20a0e58";
    const nostrEventAddressPointer = `${wavlakeTrackKind}:${wavlakePubkey}:${trackId}`;
    const invoice = await fetchInvoice({
      relayUris: writeRelayList,
      amountInSats: Number(zapAmount),
      comment,
      addressPointer: nostrEventAddressPointer,
      zappedPubkey: wavlakePubkey,
    });

    if (!invoice) {
      toast.show("Failed to fetch invoice. Please try again later.");
      setIsZapping(false);

      return;
    }

    try {
      await openInvoiceInWallet(defaultZapWallet, invoice);
    } catch {
      toast.show("Something went wrong. Please try again later.");
      setIsZapping(false);

      return;
    }

    try {
      await getZapReceipt(invoice);
      router.replace({
        pathname: "/zap/success",
        params: {
          title,
          artist,
          artworkUrl,
          zapAmount,
        },
      });
    } catch {
      // Fail silently if unable to connect to wavlake relay to get zap receipt.
    }
  };

  return (
    <>
      <KeyboardAvoidingView behavior="position">
        <ScrollView
          style={{ paddingHorizontal: 24, paddingVertical: 16 }}
          contentContainerStyle={{ alignItems: "center", gap: 16 }}
        >
          {artworkUrl && <TrackArtwork size={150} url={artworkUrl} />}
          <Center>
            <MarqueeText style={{ fontSize: 20 }} bold>
              {title}
            </MarqueeText>
            <MarqueeText style={{ fontSize: 18 }}>by {artist}</MarqueeText>
          </Center>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {["21", "100", "1000"].map((amount) => (
              <Button
                key={amount}
                width={100}
                onPress={() => setZapAmount(amount)}
              >
                {amount} ⚡️
              </Button>
            ))}
          </View>
          <TextInput
            label="amount (sats)"
            onChangeText={setZapAmount}
            value={zapAmount}
            keyboardType="numeric"
            includeErrorMessageSpace={false}
          />
          <TextInput
            label="message (optional)"
            multiline
            numberOfLines={3}
            maxLength={312}
            onChangeText={setComment}
            value={comment}
            inputHeight={96}
          />
          <Button
            onPress={handleZap}
            disabled={isZapDisabled}
            loading={isZapping}
          >
            Zap ⚡️️
          </Button>
          <CancelButton />
        </ScrollView>
      </KeyboardAvoidingView>
      <WalletChooserModal
        onContinue={async () => {
          setIsWalletChooserModalVisible(false);
          await handleZap();
        }}
        onCancel={async () => {
          setIsWalletChooserModalVisible(false);
          await cacheDefaultZapWallet("default", pubkey);
          await handleZap();
        }}
        visible={isWalletChooserModalVisible}
      />
    </>
  );
}
