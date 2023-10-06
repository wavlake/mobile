import { Button, Text, TextInput, WalletChooser } from "@/components";
import { useLocalSearchParams } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import { useAuth, useToast } from "@/hooks";
import { cacheSettings } from "@/utils";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";

export default function SettingsPage() {
  const toast = useToast();
  const { pubkey } = useAuth();
  const params = useLocalSearchParams();
  const settings = JSON.parse(params.settings as string);
  const [defaultZapAmount, setDefaultZapAmount] = useState(
    settings.defaultZapAmount ?? "",
  );
  const [defaultZapWallet, setDefaultZapWallet] = useState(
    settings.defaultZapWallet ?? "default",
  );
  const [allowListeningActivity, setAllowListeningActivity] = useState(
    settings.allowListeningActivity ?? false,
  );
  const handleSave = async () => {
    Keyboard.dismiss();
    await cacheSettings(
      { defaultZapAmount, defaultZapWallet, allowListeningActivity },
      pubkey,
    );

    toast.show("saved");
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ padding: 24, gap: 24, alignItems: "center" }}>
        <View style={{ marginBottom: 24, width: "100%" }}>
          <TextInput
            label="Default zap amount"
            value={defaultZapAmount}
            keyboardType="numeric"
            onChangeText={setDefaultZapAmount}
          />
          <WalletChooser
            selectedWallet={defaultZapWallet}
            onSelectedWalletChange={setDefaultZapWallet}
          />
          {pubkey && (
            <View
              style={{
                marginTop: 24,
                marginBottom: 4,
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text bold>Listening activity</Text>
                <Text>
                  Broadcast tracks you are listening to as a live status event
                  to Nostr relays.
                </Text>
              </View>
              <Switch
                value={allowListeningActivity}
                onValueChange={setAllowListeningActivity}
                color={brandColors.pink.DEFAULT}
              />
            </View>
          )}
        </View>
        <Button onPress={handleSave}>Save</Button>
      </View>
    </TouchableWithoutFeedback>
  );
}
