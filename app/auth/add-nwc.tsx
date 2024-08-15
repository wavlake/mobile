import { Text, Button, TextInput, useUser } from "@/components";
import { useToast } from "@/hooks";
import { useSettingsQueryKey } from "@/hooks/useSettingsQueryKey";
import {
  generateSecretKey,
  getPublicKey,
  intakeNwcURI,
  useCreateConnection,
  buildUri,
} from "@/utils";
import { bytesToHex } from "@noble/hashes/utils";
import { CheckBox } from "@rneui/base";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  View,
} from "react-native";

const msatBudgetOptions = [
  { msat: 10000000, label: "10k sats" },
  { msat: 20000000, label: "20k sats" },
  { msat: 50000000, label: "50k sats" },
  { msat: 0, label: "Unlimited" },
];

export default function AddNWC() {
  const { catalogUser } = useUser();
  const toast = useToast();
  const router = useRouter();
  const { mutate: createConnection } = useCreateConnection();
  const queryClient = useQueryClient();
  const settingsKey = useSettingsQueryKey();
  const [selectedBudget, setBudget] = useState(0);
  const [maxZapAmount, setMaxZapAmount] = useState("21");

  const onSubmit = async () => {
    const pk = generateSecretKey();
    const connectionPubkey = getPublicKey(pk);

    const msatBudget = msatBudgetOptions[selectedBudget].msat;
    const maxMsatPaymentAmount = parseInt(maxZapAmount) * 1000;
    // create the connection in the db
    await createConnection({
      name: "Wavlake Mobile App",
      msatBudget,
      pubkey: connectionPubkey,
      maxMsatPaymentAmount,
      requestMethods: ["get_balance", "pay_invoice"],
    });

    // add the connection to the mobile app
    const walletServicePubkey = process.env.EXPO_PUBLIC_WALLET_SERVICE_PUBKEY;
    const relay = "wss://relay.wavlake.com";
    const nwcUri = buildUri(`nostr+walletconnect://${walletServicePubkey}`, {
      relay: relay,
      secret: bytesToHex(pk),
      lud16: catalogUser?.profileUrl
        ? `${catalogUser.profileUrl}@wavlake.com`
        : undefined,
    });

    const { isSuccess, error, fetchInfo } = await intakeNwcURI({
      uri: nwcUri,
      pubkey: walletServicePubkey,
    });
    if (isSuccess) {
      queryClient.invalidateQueries(settingsKey);
      router.back();
      // fetch the info event and refresh settings after
      await fetchInfo?.();
      queryClient.invalidateQueries(settingsKey);
    } else {
      error && toast.show(error);
    }

    router.replace({
      pathname: "/auth/welcome",
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        style={{
          display: "flex",
          flexDirection: "column",
          paddingHorizontal: 24,
          paddingBottom: 50,
        }}
      >
        <Text style={{ fontSize: 18 }}>
          Please choose a wallet budget for this mobile app. This can be changed
          later by reconnecting your wavlake wallet with a different budget.
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Text>Select a weekly budget for this app:</Text>
          {msatBudgetOptions.map((option, index) => (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
              key={option.label}
            >
              <CheckBox
                checked={selectedBudget === index}
                onPress={() => setBudget(index)}
                checkedIcon="dot-circle-o"
                uncheckedIcon="circle-o"
              />
              <Text>{option.label}</Text>
            </View>
          ))}
          <TextInput
            label="Max Zap amount"
            keyboardType="numeric"
            onChangeText={setMaxZapAmount}
            value={maxZapAmount}
          />
        </View>
        <Button onPress={onSubmit}>Submit</Button>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
