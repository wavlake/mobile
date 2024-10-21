import { Text, TextInput, WalletChooser } from "@/components";
import { useRouter } from "expo-router";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth, useToast } from "@/hooks";
import {
  WalletKey,
  cacheSettings,
  deleteNwcSecret,
  payInvoiceCommand,
} from "@/utils";
import { useTheme } from "@react-navigation/native";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";

import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/useSettings";
import { useSettingsQueryKey } from "@/hooks/useSettingsQueryKey";

export default function SettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { pubkey, userIsLoggedIn } = useAuth();
  const { colors } = useTheme();

  const { data: settings } = useSettings();
  const [defaultZapAmount, setDefaultZapAmount] = useState(
    settings?.defaultZapAmount ?? "",
  );
  const [isFocusedOnZapAmount, setIsFocusedOnZapAmount] = useState(false);
  const [defaultZapWallet, setDefaultZapWallet] = useState<WalletKey>(
    settings?.defaultZapWallet ?? "default",
  );
  const [allowListeningActivity, setAllowListeningActivity] = useState(
    settings?.allowListeningActivity ?? false,
  );
  const [enableNWC, setEnableNWC] = useState(settings?.enableNWC ?? false);

  const [oneTapZap, setOneTapZap] = useState(settings?.oneTapZap ?? false);
  const [publishKind1, setPublishKind1] = useState(
    settings?.publishKind1 ?? false,
  );

  const queryClient = useQueryClient();
  const settingsKey = useSettingsQueryKey();

  const handleSave = async () => {
    toast.clearAll();
    Keyboard.dismiss();
    await cacheSettings(
      {
        defaultZapAmount,
        defaultZapWallet,
        allowListeningActivity,
        enableNWC,
        oneTapZap,
        publishKind1,
      },
      pubkey,
    );
    queryClient.invalidateQueries(settingsKey);
    toast.show("saved");
  };

  // autosave settings on change
  useEffect(() => {
    if (!settings || isFocusedOnZapAmount) return;
    if (
      defaultZapAmount !== settings.defaultZapAmount ||
      defaultZapWallet !== settings.defaultZapWallet ||
      allowListeningActivity !== settings.allowListeningActivity ||
      enableNWC !== settings.enableNWC ||
      oneTapZap !== settings.oneTapZap ||
      publishKind1 !== settings.publishKind1
    ) {
      handleSave();
    }
  }, [
    isFocusedOnZapAmount,
    defaultZapWallet,
    allowListeningActivity,
    enableNWC,
    oneTapZap,
    publishKind1,
  ]);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/settings/advanced" })}
          >
            <View style={{ flex: 1 }}>
              <Text bold>Advanced Settings</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
