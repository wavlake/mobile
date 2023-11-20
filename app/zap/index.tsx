import {
  MarqueeText,
  SquareArtwork,
  CancelButton,
  Button,
  TextInput,
  Center,
} from "@/components";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useZap } from "@/hooks";

export default function ZapPage() {
  const { defaultZapAmount, title, artist, artworkUrl, trackId } =
    useLocalSearchParams<{
      defaultZapAmount: string;
      title: string;
      artist: string;
      artworkUrl: string;
      trackId: string;
    }>();

  const [zapAmount, setZapAmount] = useState(defaultZapAmount as string);
  const [comment, setComment] = useState("");
  const { sendZap, isLoading: isZapping } = useZap({
    trackId,
    title,
    artist,
    artworkUrl,
  });
  const isZapDisabled =
    zapAmount.length === 0 || Number(zapAmount) <= 0 || isZapping;

  const handleZap = async () => {
    sendZap(comment, parseInt(zapAmount));
  };

  return (
    <KeyboardAvoidingView behavior="position">
      <ScrollView
        style={{ paddingHorizontal: 24, paddingVertical: 16 }}
        contentContainerStyle={{ alignItems: "center", gap: 16 }}
      >
        {artworkUrl && <SquareArtwork size={150} url={artworkUrl} />}
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
  );
}
