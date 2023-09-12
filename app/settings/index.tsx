import { Center, Button, TextInput } from "@/components";
import { Stack, useLocalSearchParams } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import { useAuth, useToast } from "@/hooks";
import { cacheDefaultZapAmount } from "@/utils";

export default function SettingsPage() {
  const toast = useToast();
  const { pubkey } = useAuth();
  const params = useLocalSearchParams();
  const [defaultZapAmount, setDefaultZapAmount] = useState(
    params.defaultZapAmount as string,
  );
  const isDisabled = Number(defaultZapAmount) <= 0;
  const handleSave = async () => {
    Keyboard.dismiss();
    await cacheDefaultZapAmount(defaultZapAmount, pubkey);
    toast.show("saved");
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Settings" }} />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <Center style={{ paddingHorizontal: 36 }}>
          <View style={{ marginBottom: 24, width: "100%" }}>
            <TextInput
              label="default zap amount"
              value={defaultZapAmount}
              keyboardType="numeric"
              onChangeText={setDefaultZapAmount}
            />
          </View>
          <Button onPress={handleSave} disabled={isDisabled}>
            Save
          </Button>
        </Center>
      </TouchableWithoutFeedback>
    </>
  );
}
