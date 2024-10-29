import React, { useState } from "react";
import {
  Button,
  TextInput,
  OrSeparator,
  ExternalLoginProviders,
  LogoIcon,
} from "@/components";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { DEFAULT_CONNECTION_SETTINGS, useAutoConnectNWC } from "@/hooks";
import DeviceInfo from "react-native-device-info";

// Separate interfaces for form data and form state
interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormState {
  data: LoginFormData;
  isLoading: boolean;
  errorMessage: string;
}

const initialFormState: LoginFormState = {
  data: {
    email: "",
    password: "",
  },
  isLoading: false,
  errorMessage: "",
};

export default function Login() {
  const router = useRouter();
  const { signInWithEmail } = useUser();
  const { connectWallet } = useAutoConnectNWC();
  const [formState, setFormState] = useState<LoginFormState>(initialFormState);

  const updateFormData = (field: keyof LoginFormData, value: string) => {
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      errorMessage: "", // Only clear error when user makes changes
    }));
  };

  const setLoading = (isLoading: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isLoading,
    }));
  };

  const setError = (errorMessage: string) => {
    setFormState((prev) => ({
      ...prev,
      errorMessage,
    }));
  };

  const validateForm = (): boolean => {
    const { email, password } = formState.data;
    if (!email || !password) {
      setError("Please enter your email and password");
      return false;
    }
    return true;
  };

  const handleWalletConnection = async (userId: string) => {
    await connectWallet(
      {
        ...DEFAULT_CONNECTION_SETTINGS,
        connectionName: DeviceInfo.getModel(),
      },
      userId,
    );
  };

  const handleLoginSuccess = async (signedInUser: any) => {
    if (signedInUser.isEmailVerified && signedInUser.isRegionVerified) {
      await handleWalletConnection(signedInUser.user.uid);
    }
    router.replace({ pathname: "/auth/welcome" });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const { email, password } = formState.data;
      const signedInUser = await signInWithEmail(email, password);

      if ("error" in signedInUser) {
        setError(signedInUser.error);
        return;
      }

      await handleLoginSuccess(signedInUser);
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <LogoIcon fill="white" width={130} height={108} />
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email Address"
            autoCorrect={false}
            value={formState.data.email}
            keyboardType="email-address"
            onChangeText={(value) => updateFormData("email", value)}
          />

          <TextInput
            label="Password"
            secureTextEntry
            autoCorrect={false}
            value={formState.data.password}
            keyboardType="default"
            onChangeText={(value) => updateFormData("password", value)}
            errorMessage={formState.errorMessage}
          />
        </View>

        <Button
          color="white"
          onPress={handleSubmit}
          loading={formState.isLoading}
        >
          Login
        </Button>

        <OrSeparator />

        <ExternalLoginProviders setIsLoading={setLoading} />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 20,
  },
  logoContainer: {
    marginVertical: 30,
  },
  formContainer: {
    width: "100%",
  },
});
