import { Button, Text, TextInput, WalletChooser } from "@/components";
import { Stack, useLocalSearchParams } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import { useAuth, useToast } from "@/hooks";
import {
  cacheAllowListeningActivity,
  cacheDefaultZapAmount,
  cacheDefaultZapWallet,
  WalletKey,
} from "@/utils";
import { Switch } from "@rneui/themed";
import { brandColors } from "@/constants";

export default function SettingsPage() {
  const toast = useToast();
  const { pubkey } = useAuth();
  const params = useLocalSearchParams();
  const [defaultZapAmount, setDefaultZapAmount] = useState(
    params.defaultZapAmount as string,
  );
  const [defaultZapWallet, setDefaultZapWallet] = useState(
    params.defaultZapWallet as WalletKey,
  );
  const [allowListeningActivity, setAllowListeningActivity] = useState(
    params.allowListeningActivity as "0" | "1",
  );
  const handleSave = async () => {
    Keyboard.dismiss();
    await cacheDefaultZapAmount(defaultZapAmount, pubkey);
    await cacheDefaultZapWallet(defaultZapWallet, pubkey);

    if (pubkey) {
      await cacheAllowListeningActivity(allowListeningActivity, pubkey);
    }

    toast.show("saved");
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Settings" }} />
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
                  value={allowListeningActivity === "1"}
                  onValueChange={(value) =>
                    setAllowListeningActivity(value ? "1" : "0")
                  }
                  color={brandColors.pink.DEFAULT}
                />
              </View>
            )}
          </View>
          <Button onPress={handleSave}>Save</Button>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}
