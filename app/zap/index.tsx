import {
  MarqueeText,
  SquareArtwork,
  CancelButton,
  Button,
  TextInput,
  Center,
  Text,
  DollarAmount,
} from "@/components";
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth, useSettingsManager, useZap } from "@/hooks";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";
import { useTheme } from "@react-navigation/native";
import { ArrowTopRightOnSquareIcon } from "react-native-heroicons/solid";
import { WalletBalance } from "@/components/WalletBalance";

export default function ZapPage() {
  const {
    defaultZapAmount,
    title,
    artist,
    artworkUrl,
    trackId,
    timestamp,
    isPodcast,
    parentContentId,
  } = useLocalSearchParams<{
    defaultZapAmount: string;
    title: string;
    artist: string;
    artworkUrl: string;
    trackId: string;
    timestamp: string;
    isPodcast: string;
    parentContentId: string;
  }>();
  const router = useRouter();
  const { pubkey } = useAuth();
  const [zapAmount, setZapAmount] = useState(defaultZapAmount ?? "");
  const [zapError, setZapError] = useState<string>("");
  const [comment, setComment] = useState("");
  const { sendZap, isLoading: isZapping } = useZap({
    trackId,
    title,
    artist,
    artworkUrl,
    timestamp: timestamp ? parseInt(timestamp) : 0,
    isPodcast: isPodcast === "true",
    parentContentId,
  });

  const validateAndSetZapAmount = useCallback((value: string) => {
    // Remove any non-numeric characters and decimal points
    const cleanValue = value.replace(/[^\d]/g, "");
    setZapAmount(cleanValue);

    if (cleanValue === "") {
      setZapError("Amount is required");
      return;
    }

    const numericValue = parseInt(cleanValue, 10);

    if (isNaN(numericValue)) {
      setZapError("Please enter a valid number");
      return;
    }

    if (numericValue < 1 || numericValue > 100000) {
      setZapError("Amount must be between 1 and 100,000 sats");
      return;
    }

    setZapError("");
  }, []);

  const isZapDisabled =
    zapAmount.length === 0 ||
    Number(zapAmount) <= 0 ||
    isZapping ||
    zapError !== "";

  const handleZap = async () => {
    const numericAmount = parseInt(zapAmount, 10);
    if (numericAmount >= 1 && numericAmount <= 100000) {
      sendZap({ comment, amount: numericAmount, useNavReplace: true });
    }
  };

  const { settings, updateSettings } = useSettingsManager();
  const { colors } = useTheme();

  const currentPublishKind1Setting = settings?.publishKind1 ?? false;
  const togglePublishKind1 = async (value: boolean) => {
    await updateSettings({
      publishKind1: !currentPublishKind1Setting,
    });
  };

  return (
    <KeyboardAvoidingView behavior="position">
      <ScrollView
        style={{ paddingHorizontal: 24, paddingVertical: 16 }}
        contentContainerStyle={{
          alignItems: "center",
          gap: 12,
        }}
      >
        {artworkUrl && <SquareArtwork size={150} url={artworkUrl} />}
        <Center>
          <MarqueeText style={{ fontSize: 20 }} bold>
            {title}
          </MarqueeText>
          <MarqueeText style={{ fontSize: 18 }}>by {artist}</MarqueeText>
        </Center>
        <WalletBalance />
        <TextInput
          label="amount (sats)"
          onChangeText={validateAndSetZapAmount}
          value={zapAmount}
          keyboardType="numeric"
          errorMessage={zapError}
          rightIcon={
            <DollarAmount
              style={{ textAlign: "right" }}
              sats={parseInt(zapAmount) || 0}
            />
          }
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
        <View style={{ flexDirection: "row", marginTop: -16 }}>
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
        {!pubkey && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text>
                You are not connected to nostr, zaps and comments will be
                anonymous.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                router.push("/settings");
                router.push("/settings/advanced");
                router.push("/settings/nsec");
              }}
            >
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Text>Connect</Text>
                <ArrowTopRightOnSquareIcon
                  color={brandColors.beige.dark}
                  height={20}
                  width={20}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}
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
