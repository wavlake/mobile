import {
  MarqueeText,
  SquareArtwork,
  CancelButton,
  Button,
  TextInput,
  Center,
  Text,
} from "@/components";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useAuth, useZap } from "@/hooks";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";
import { useTheme } from "@react-navigation/native";
import { useSettings } from "@/hooks/useSettings";
import { useQueryClient } from "@tanstack/react-query";
import { useSettingsQueryKey } from "@/hooks/useSettingsQueryKey";
import { cacheSettings } from "@/utils";

export default function ZapPage() {
  const {
    defaultZapAmount,
    title,
    artist,
    artworkUrl,
    trackId,
    timestamp,
    isPodcast,
  } = useLocalSearchParams<{
    defaultZapAmount: string;
    title: string;
    artist: string;
    artworkUrl: string;
    trackId: string;
    timestamp: string;
    isPodcast: string;
  }>();

  const [zapAmount, setZapAmount] = useState(defaultZapAmount ?? "");
  const [comment, setComment] = useState("");
  const { sendZap, isLoading: isZapping } = useZap({
    trackId,
    title,
    artist,
    artworkUrl,
    timestamp: timestamp ? parseInt(timestamp) : 0,
    isPodcast: isPodcast === "true",
  });
  const isZapDisabled =
    zapAmount.length === 0 || Number(zapAmount) <= 0 || isZapping;
  const handleZap = async () => {
    sendZap({ comment, amount: parseInt(zapAmount), useNavReplace: true });
  };

  const { data: settings } = useSettings();
  const { colors } = useTheme();
  const { pubkey } = useAuth();
  const queryClient = useQueryClient();
  const settingsKey = useSettingsQueryKey();
  // this new setting will start as undefined for users
  const currentPublishKind1Setting = settings?.publishKind1 ?? false;
  const togglePublishKind1 = async (value: boolean) => {
    await cacheSettings(
      {
        publishKind1: !currentPublishKind1Setting,
      },
      pubkey,
    );
    queryClient.invalidateQueries(settingsKey);
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
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text bold>Publish comments to nostr</Text>
            <Text>Comments will show up in other clients.</Text>
          </View>
          <Switch
            value={settings?.publishKind1 ?? false}
            onValueChange={togglePublishKind1}
            color={brandColors.pink.DEFAULT}
            trackColor={{
              false: colors.border,
              true: brandColors.pink.DEFAULT,
            }}
            thumbColor={colors.text}
          />
        </View>
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
