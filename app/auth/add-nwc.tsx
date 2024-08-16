import { Text, Button, TextInput, useUser } from "@/components";
import { brandColors } from "@/constants";
import { useAuth, useToast } from "@/hooks";
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
  { msat: 10000000, label: "10k sats per week" },
  { msat: 20000000, label: "20k sats per week" },
  { msat: 50000000, label: "50k sats per week" },
  { msat: 0, label: "Unlimited" },
];

export default function AddNWC() {
  const { catalogUser } = useUser();
  const { pubkey: userPubkey } = useAuth();
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
      pubkey: userPubkey,
    });
    if (isSuccess) {
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
          paddingVertical: 24,
          paddingHorizontal: 24,
        }}
        contentContainerStyle={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Text style={{ fontSize: 18 }}>
          Your mobile app will now be connected to your Wavlake wallet. Please
          choose a weekly budget and a max zap amount.
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Text>Select a weekly budget for this app</Text>
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
                containerStyle={{
                  backgroundColor: "transparent",
                }}
                checkedColor={brandColors.pink.DEFAULT}
              />
              <Text>{option.label}</Text>
            </View>
          ))}
        </View>
        <TextInput
          label="Max Zap amount"
          keyboardType="numeric"
          onChangeText={setMaxZapAmount}
          value={maxZapAmount}
        />
        <Button onPress={onSubmit}>Submit</Button>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
