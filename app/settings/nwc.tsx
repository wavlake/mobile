import { Button, Text, TextInput } from "@/components";
import { useRouter } from "expo-router";
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from "react-native";
import {
  useToast,
  useSettingsManager,
  useAutoConnectNWC,
  DEFAULT_CONNECTION_SETTINGS,
} from "@/hooks";
import { useTheme } from "@react-navigation/native";
import { useState, useEffect, useCallback, useMemo } from "react";
import DeviceInfo from "react-native-device-info";
import { useWalletBalance } from "@/hooks/useWalletBalance";

// Constants
const MIN_AMOUNT = 1;
const MSATS_MULTIPLIER = 1000;

// Types
interface WalletSettings {
  weeklyBudget: string;
  maxZapAmount: string;
}

interface ValidationErrors {
  weeklyBudget?: string;
  maxZapAmount?: string;
}

// Utility functions
const msatsToSats = (msats: number): string =>
  msats ? (msats / MSATS_MULTIPLIER).toString() : "";

const satsToMsats = (sats: string): number =>
  parseInt(sats) * MSATS_MULTIPLIER || 0;

const isValidNumber = (amount: string): boolean => {
  const num = parseInt(amount);
  return !isNaN(num) && num >= MIN_AMOUNT;
};

const parseDefaultZapAmount = (amount: string | number | undefined): number => {
  if (typeof amount === "string") {
    return parseInt(amount) || 0;
  }
  if (typeof amount === "number") {
    return amount;
  }
  return 0;
};

export default function WalletConnectionSettingsPage() {
  const toast = useToast();
  const router = useRouter();
  const { colors } = useTheme();
  const { settings, updateSettings } = useSettingsManager();
  const { connectWallet } = useAutoConnectNWC();

  const { data } = useWalletBalance();
  const { budget: weeklyNWCBudget, max_payment: maxNWCPayment } = data || {};

  // Form state
  const [formData, setFormData] = useState<WalletSettings>({
    weeklyBudget: "",
    maxZapAmount: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Get the default zap amount in sats
  const defaultZapSats = useMemo(() => {
    if (!settings?.defaultZapAmount) return 0;
    return parseDefaultZapAmount(settings.defaultZapAmount);
  }, [settings?.defaultZapAmount]);

  // Initialize form data from settings
  useEffect(() => {
    if (weeklyNWCBudget && maxNWCPayment) {
      setFormData({
        weeklyBudget: msatsToSats(weeklyNWCBudget),
        maxZapAmount: msatsToSats(maxNWCPayment),
      });
    }
  }, [weeklyNWCBudget, maxNWCPayment]);

  // Validate form and return errors
  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Basic number validation
    if (!isValidNumber(formData.weeklyBudget)) {
      newErrors.weeklyBudget = "Please enter a positive number";
    }

    if (!isValidNumber(formData.maxZapAmount)) {
      newErrors.maxZapAmount = "Please enter a positive number";
    }

    // Only proceed with range validation if both numbers are valid
    if (Object.keys(newErrors).length === 0) {
      const weeklyBudgetSats = parseInt(formData.weeklyBudget);
      const maxZapSats = parseInt(formData.maxZapAmount);

      // Validate max zap amount is less than weekly budget
      if (maxZapSats >= weeklyBudgetSats) {
        newErrors.maxZapAmount =
          "Maximum zap amount must be less than your weekly budget";
      }

      // Validate max zap amount is more than default zap amount
      if (maxZapSats <= defaultZapSats) {
        newErrors.maxZapAmount = `Maximum zap amount must be more than your default zap amount (${defaultZapSats} sats)`;
      }
    }

    return newErrors;
  }, [formData, defaultZapSats]);

  // Memoize form validity
  const { isValid, validationErrors } = useMemo(() => {
    const errors = validateForm();
    return {
      isValid: Object.keys(errors).length === 0,
      validationErrors: errors,
    };
  }, [validateForm]);

  // Update handlers
  const handleInputChange =
    (field: keyof WalletSettings) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSave = async () => {
    const currentErrors = validateForm();
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      toast.show("Please correct the errors before saving");
      return;
    }

    try {
      setIsSaving(true);
      toast.clearAll();
      Keyboard.dismiss();

      // Connect wallet
      const { success } = await connectWallet({
        ...DEFAULT_CONNECTION_SETTINGS,
        msatBudget: satsToMsats(formData.weeklyBudget),
        maxMsatPaymentAmount: satsToMsats(formData.maxZapAmount),
        connectionName: DeviceInfo.getModel(),
      });

      if (!success) {
        throw new Error("Failed to connect wallet");
      }

      // Update settings
      await updateSettings({
        weeklyNWCBudget: satsToMsats(formData.weeklyBudget),
        maxNWCPayment: satsToMsats(formData.maxZapAmount),
      });

      toast.show("Settings saved");
      router.back();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.show(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) return null;

  const constraintsText = `Must be between your default zap amount (${defaultZapSats} sats) and your weekly budget`;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text bold>Weekly Budget</Text>
          <Text>Set your maximum weekly spending limit for this wallet</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="Enter amount in sats"
            placeholderTextColor={colors.text}
            value={formData.weeklyBudget}
            onChangeText={handleInputChange("weeklyBudget")}
            errorMessage={errors.weeklyBudget || validationErrors.weeklyBudget}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text bold>Maximum Zap Payment</Text>
          <Text>Set the maximum amount allowed for a single zap</Text>
          <Text style={styles.constraintText}>{constraintsText}</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="Enter amount in sats"
            placeholderTextColor={colors.text}
            value={formData.maxZapAmount}
            onChangeText={handleInputChange("maxZapAmount")}
            errorMessage={errors.maxZapAmount || validationErrors.maxZapAmount}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            color="pink"
            onPress={handleSave}
            loading={isSaving}
            disabled={!isValid || isSaving}
          >
            Save
          </Button>
          <Button
            color="white"
            onPress={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    height: "100%",
  },
  inputContainer: {
    gap: 8,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 10,
    alignItems: "center",
  },
  constraintText: {
    fontSize: 12,
    color: "gray",
    fontStyle: "italic",
  },
});
