import {
  MarqueeText,
  SongArtwork,
  CancelButton,
  Button,
  TextInput,
  Center,
} from "@/components";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { useNostrRelayList, useToast } from "@/hooks";
import { fetchInvoice } from "@/utils";
import { WalletKey, WALLETS } from "@/constants";

export default function ZapPage() {
  const toast = useToast();
  const {
    defaultZapAmount,
    defaultZapWallet,
    title,
    artist,
    artworkUrl,
    trackId,
  } = useLocalSearchParams<{
    defaultZapAmount: string;
    defaultZapWallet?: WalletKey;
    title: string;
    artist: string;
    artworkUrl: string;
    trackId: string;
  }>();
  const [zapAmount, setZapAmount] = useState(defaultZapAmount as string);
  const [isZapping, setIsZapping] = useState(false);
  const [comment, setComment] = useState("");
  const isZapDisabled =
    zapAmount.length === 0 || Number(zapAmount) <= 0 || isZapping;
  const { writeRelayList } = useNostrRelayList();
  const hanldeZap = async () => {
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
      return;
    }

    const key: WalletKey = defaultZapWallet || "default";
    const { uriPrefix, iosFallbackLink } = WALLETS[key];

    try {
      await Linking.openURL(`${uriPrefix}${invoice}`);
    } catch {
      try {
        if (iosFallbackLink) {
          await Linking.openURL(iosFallbackLink);
        }
      } catch {
        toast.show("Something went wrong. Please try again later.");
      }
    } finally {
      setIsZapping(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="position">
      <ScrollView
        style={{ paddingHorizontal: 24, paddingVertical: 16 }}
        contentContainerStyle={{ alignItems: "center", gap: 16 }}
      >
        {artworkUrl && <SongArtwork size={150} url={artworkUrl} />}
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
          onPress={hanldeZap}
          disabled={isZapDisabled}
          loading={isZapping}
        >
          Zap ⚡️️
        </Button>
        <CancelButton />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
