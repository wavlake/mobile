import { Text, Button, TextInput, useUser } from "@/components";
import { brandColors } from "@/constants";
import { useAuth, useToast } from "@/hooks";
import { useSettingsQueryKey } from "@/hooks/useSettingsQueryKey";
import DeviceInfo from "react-native-device-info";
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
const validateMaxZapAmount = (value?: string) => {
  if (!value || value === "") {
    return "Please enter a max zap amount";
  }
  if (isNaN(parseInt(value)) || parseInt(value) < 0) {
    return "Please enter a postive integer";
  }

  return;
};

export default function AddNWC() {
  const { catalogUser } = useUser();
  const { pubkey: userPubkey } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { mutate: createConnection } = useCreateConnection();
  const queryClient = useQueryClient();
  const settingsKey = useSettingsQueryKey();
  const [selectedBudget, setBudget] = useState(0);
  const [maxZapAmount, setMaxZapAmount] = useState<string | undefined>();
  const [zapAmountErrorMessage, setzapAmountErrorMessage] = useState("");
  const [connectionNameErrorMessage, setConnectionNameErrorMessage] =
    useState("");

  const [connectionName, setConnectionName] = useState(DeviceInfo.getModel());
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    const zapAmountError = validateMaxZapAmount(maxZapAmount);

    if (zapAmountError) {
      setzapAmountErrorMessage(zapAmountError);
    }

    if (!connectionName) {
      setConnectionNameErrorMessage("Please enter a connection name");
    }

    if (zapAmountError || !connectionName || !maxZapAmount) {
      return;
    }

    setIsLoading(true);
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
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 18, alignSelf: "flex-start" }}>
          Your mobile app will now be connected to your Wavlake wallet. Please
          choose a weekly budget and a max zap amount.
        </Text>
        <Text
          style={{ fontSize: 18, alignSelf: "flex-start", paddingBottom: 16 }}
        >
          Visit wavlake.com to manage connections to your wallet.
        </Text>
        <TextInput
          label="Connection Name"
          keyboardType="default"
          onChangeText={(value) => {
            setConnectionNameErrorMessage("");
            setConnectionName(value);
          }}
          value={connectionName}
          errorMessage={connectionNameErrorMessage}
        />
        <TextInput
          errorMessage={zapAmountErrorMessage}
          label="Max Zap amount (sats)"
          keyboardType="numeric"
          onChangeText={(value) => {
            setzapAmountErrorMessage("");
            setMaxZapAmount(value);
          }}
          value={maxZapAmount}
        />
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 18 }}>
            Select a weekly budget for this app
          </Text>
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
              <Text style={{ fontSize: 18 }}>{option.label}</Text>
            </View>
          ))}
        </View>

        <Button loading={isLoading} onPress={onSubmit}>
          Submit
        </Button>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
