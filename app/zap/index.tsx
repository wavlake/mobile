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
import { useToast } from "@/hooks";

export default function ZapPage() {
  const toast = useToast();
  const { defaultZapAmount, title, artist, artworkUrl } = useLocalSearchParams<{
    defaultZapAmount: string;
    title: string;
    artist: string;
    artworkUrl: string;
  }>();
  const [zapAmount, setZapAmount] = useState(defaultZapAmount as string);
  const [comment, setComment] = useState("");
  const isZapDisabled = zapAmount.length === 0 || Number(zapAmount) <= 0;
  const hanldeZap = () => {
    toast.show(`TODO: send zap. amount: ${zapAmount}, comment: ${comment}`);
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
        <Button onPress={hanldeZap} disabled={isZapDisabled}>
          Zap ⚡️️
        </Button>
        <CancelButton />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
