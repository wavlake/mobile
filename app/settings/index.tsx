import { Button, TextInput, WalletChooser } from "@/components";
import { Stack, useLocalSearchParams } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import { useAuth, useToast } from "@/hooks";
import { cacheDefaultZapAmount, cacheDefaultZapWallet } from "@/utils";
import { WalletKey } from "@/constants";

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
  const handleSave = async () => {
    Keyboard.dismiss();
    await cacheDefaultZapAmount(defaultZapAmount, pubkey);
    await cacheDefaultZapWallet(defaultZapWallet, pubkey);
    toast.show("saved");
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Settings" }} />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ padding: 24, gap: 24, alignItems: "center" }}>
          <View style={{ marginBottom: 24, width: "100%" }}>
            <TextInput
              label="default zap amount"
              value={defaultZapAmount}
              keyboardType="numeric"
              onChangeText={setDefaultZapAmount}
            />
            <WalletChooser
              selectedWallet={defaultZapWallet}
              onSelectedWalletChange={setDefaultZapWallet}
            />
          </View>
          <Button onPress={handleSave}>Save</Button>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}
