import { useState } from "react";
import {
  Button,
  TextInput,
  LogoIcon,
  OrSeparator,
  Text,
  ExternalLoginProviders,
  useUser,
} from "@/components";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { CheckBox } from "@rneui/base";
import { brandColors } from "@/constants";
import { useAuth, useCreateNewNostrAccount, useToast } from "@/hooks";
import { saveSecretToKeychain } from "@/utils";
import { useValidateUsername } from "@/hooks/useValidateUsername";

interface SignUpFormState {
  fullname: string;
  username: string;
  email: string;
  password: string;
  tosChecked: boolean;
  isLoading: boolean;
  errors: {
    name?: string;
    user?: string;
    email?: string;
    password?: string;
    tos?: boolean;
  };
}

const initialFormState: SignUpFormState = {
  fullname: "",
  username: "",
  email: "",
  password: "",
  tosChecked: false,
  isLoading: false,
  errors: {},
};

const TERMS = {
  WAVLAKE:
    "https://wavlake.notion.site/Terms-of-Service-c8713bd924b64b3fb3b510b6a4bc1b9c",
  ZBD: "https://zbd.gg/z/terms",
};

export default function SignUpPage() {
  const { isRegionVerified: isVerifiedString } = useLocalSearchParams<{
    isRegionVerified: "true" | "false";
  }>();
  const isRegionVerified = isVerifiedString === "true";

  const router = useRouter();
  const { login, pubkey } = useAuth();
  const { createUserWithEmail } = useUser();
  const createNewNostrAccount = useCreateNewNostrAccount();
  const toast = useToast();

  const [formState, setFormState] = useState<SignUpFormState>(initialFormState);
  const { refetch: validateUsername } = useValidateUsername(formState.username);

  const updateFormField = <K extends keyof SignUpFormState>(
    field: K,
    value: SignUpFormState[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined, // Clear specific field error
      },
    }));
  };

  const validateForm = async (): Promise<boolean> => {
    const errors: SignUpFormState["errors"] = {};

    if (isRegionVerified) {
      if (!formState.fullname) {
        errors.name = "Full name is required";
      } else if (!formState.fullname.match(/\w+\s\w+/)) {
        errors.name = "Please enter your full name separated by a space";
      }
    }
    if (formState.username && !formState.username.match(/^[a-zA-Z0-9-_]+$/)) {
      errors.user =
        "Username can only contain letters, numbers, hyphens, and underscores";
    }
    const data = await validateUsername();
    const { success: usernameAvailable } = data.data || {};
    if (!usernameAvailable) {
      errors.user = "Username unavailable, please try another";
    }

    if (!formState.email) {
      errors.email = "Please enter your email address";
    }

    if (!formState.password) {
      errors.password = "Please enter a password";
    }

    if (isRegionVerified && !formState.tosChecked) {
      errors.tos = true;
    }

    setFormState((prev) => ({
      ...prev,
      errors,
    }));

    return Object.keys(errors).length === 0;
  };

  const handleNostrAccountCreation = async (username?: string) => {
    const { nsec, pubkey } = await createNewNostrAccount(
      username ? { name: username } : {},
    );

    if (!pubkey || !nsec) {
      throw new Error("Failed to generate nostr account");
    }

    saveSecretToKeychain(formState.email, nsec);
    await login(nsec);

    return pubkey;
  };

  const createUserAccount = async (pubkey: string) => {
    const [firstName, lastName] = formState.fullname
      ? formState.fullname.split(" ")
      : [];

    const userResult = await createUserWithEmail({
      email: formState.email,
      password: formState.password,
      firstName,
      lastName,
      username: formState.username,
      pubkey,
    });

    if ("error" in userResult) {
      throw new Error(userResult.error);
    }

    return userResult;
  };

  const handleSignUp = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setFormState((prev) => ({ ...prev, isLoading: true }));

      let currentPubkey = pubkey;

      if (!currentPubkey) {
        currentPubkey = await handleNostrAccountCreation(formState.username);
      }

      await createUserAccount(currentPubkey);

      router.replace({ pathname: "/auth/email-ver" });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.show(errorMessage);

      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          password: errorMessage,
        },
      }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior="padding" enabled>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.logoContainer}>
            <LogoIcon fill="white" width={130} height={108} />
          </View>

          <View style={styles.formContainer}>
            {isRegionVerified && (
              <TextInput
                label="Full Name"
                autoCorrect={false}
                value={formState.fullname}
                onChangeText={(value) => updateFormField("fullname", value)}
                errorMessage={formState.errors.name}
              />
            )}

            <TextInput
              label="Email Address"
              autoCorrect={false}
              value={formState.email}
              keyboardType="email-address"
              onChangeText={(value) => updateFormField("email", value)}
              errorMessage={formState.errors.email}
            />

            <TextInput
              label="Username"
              textContentType="none"
              autoCorrect={false}
              value={formState.username}
              onChangeText={(value) => updateFormField("username", value)}
              errorMessage={formState.errors.user}
            />

            <TextInput
              label="Password"
              secureTextEntry
              autoCorrect={false}
              value={formState.password}
              keyboardType="visible-password"
              onChangeText={(value) => updateFormField("password", value)}
              errorMessage={formState.errors.password}
            />

            {isRegionVerified && (
              <AgreementCheckbox
                checked={formState.tosChecked}
                onCheckChanged={(checked) =>
                  updateFormField("tosChecked", checked)
                }
                showError={formState.errors.tos}
              />
            )}
          </View>

          <Button
            color="white"
            onPress={handleSignUp}
            loading={formState.isLoading}
          >
            Sign Up
          </Button>

          <OrSeparator />

          <ExternalLoginProviders
            setIsLoading={(loading) => updateFormField("isLoading", loading)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

interface AgreementCheckboxProps {
  checked: boolean;
  onCheckChanged: (checked: boolean) => void;
  showError?: boolean;
}

const AgreementCheckbox: React.FC<AgreementCheckboxProps> = ({
  checked,
  onCheckChanged,
  showError,
}) => (
  <View style={styles.agreementContainer}>
    <View style={styles.checkboxContainer}>
      <CheckBox
        checked={checked}
        onPress={() => onCheckChanged(!checked)}
        iconType="material-community"
        checkedIcon="checkbox-outline"
        uncheckedIcon="checkbox-blank-outline"
        containerStyle={styles.checkbox}
        size={28}
        checkedColor="white"
      />
      <View style={styles.textContainer}>
        <Text>
          {"I agree to "}
          <Text
            onPress={() => Linking.openURL(TERMS.WAVLAKE)}
            style={styles.link}
          >
            terms
          </Text>
          {" and "}
          <Text onPress={() => Linking.openURL(TERMS.ZBD)} style={styles.link}>
            payments
          </Text>
          {" policy."}
        </Text>
      </View>
    </View>
    {showError && (
      <Text style={styles.errorText}>
        Please agree to the Terms of Service.
      </Text>
    )}
  </View>
);

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
  agreementContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    backgroundColor: "transparent",
    marginLeft: 0,
    marginRight: 10,
    padding: 0,
  },
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  link: {
    color: brandColors.purple.DEFAULT,
  },
  errorText: {
    textAlign: "center",
    marginTop: 4,
    color: "red",
  },
});
