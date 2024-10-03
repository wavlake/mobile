import { Text, Button, TextInput } from "@/components";
import { brandColors } from "@/constants";
import DeviceInfo from "react-native-device-info";
import { CheckBox } from "@rneui/base";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  View,
} from "react-native";
import { useAutoConnectNWC, useToast } from "@/hooks";

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
    return "Please enter a positive integer";
  }
  return;
};

export default function AddNWC() {
  const router = useRouter();
  const toast = useToast();
  const { createdRandomNpub } = useLocalSearchParams<{
    createdRandomNpub: "true" | "false";
  }>();
  const { connectWallet } = useAutoConnectNWC();
  const [selectedBudget, setBudget] = useState(0);
  const [maxZapAmount, setMaxZapAmount] = useState<string | undefined>();
  const [zapAmountErrorMessage, setZapAmountErrorMessage] = useState("");
  const [connectionNameErrorMessage, setConnectionNameErrorMessage] =
    useState("");
  const [connectionName, setConnectionName] = useState(DeviceInfo.getModel());
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    const zapAmountError = validateMaxZapAmount(maxZapAmount);

    if (zapAmountError) {
      setZapAmountErrorMessage(zapAmountError);
    }

    if (!connectionName) {
      setConnectionNameErrorMessage("Please enter a connection name");
    }

    if (zapAmountError || !connectionName || !maxZapAmount) {
      return;
    }

    setIsLoading(true);

    const msatBudget = msatBudgetOptions[selectedBudget].msat;
    const maxMsatPaymentAmount = parseInt(maxZapAmount) * 1000;

    try {
      const { success } = await connectWallet({
        connectionName,
        msatBudget,
        maxMsatPaymentAmount,
        requestMethods: ["get_balance", "pay_invoice"],
      });
      if (success) {
        router.replace({
          pathname: "/auth/welcome",
          params: {
            createdRandomNpub,
          },
        });
      }
    } catch (error) {
      console.error("Failed to establish connection:", error);
      toast.show("Failed to establish connection");
    } finally {
      setIsLoading(false);
    }
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
            setZapAmountErrorMessage("");
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
