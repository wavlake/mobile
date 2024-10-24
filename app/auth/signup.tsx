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

const ZBD_TOS = "https://zbd.gg/z/terms";
const WAVLAKE_TOS =
  "https://wavlake.notion.site/Terms-of-Service-c8713bd924b64b3fb3b510b6a4bc1b9c";

const SignUpPage = () => {
  const { isRegionVerified: isVerifiedString } = useLocalSearchParams<{
    isRegionVerified: "true" | "false";
  }>();
  const { login } = useAuth();
  const { createUserWithEmail } = useUser();
  const isRegionVerified = isVerifiedString === "true";
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [nameErrorMsg, setNameErrorMsg] = useState("");
  const [username, setUsername] = useState("");
  const [userErrorMsg, setUserErrorMsg] = useState("");
  const [tosChecked, setTosChecked] = useState(false);
  const [tosError, setTosError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailErrorMsg, setEmailErrorMsg] = useState("");
  const [password, setPassword] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const createNewNostrAccount = useCreateNewNostrAccount();
  const toast = useToast();
  const formIsValid = () => {
    // fullname must be at least two space-separated words

    if (username) {
      // username must be compatible with a url, e.g. wavlake.com/username/satoshi-nakamoto
      if (!username.match(/^[a-zA-Z0-9-_]+$/)) {
        setUserErrorMsg(
          "Username can only contain letters, numbers, hyphens, and underscores.",
        );
        return false;
      }
    }

    if (isRegionVerified && !fullname) {
      // show a popup saying "You must enter your full name if you want to use the built in wallet"?
    }

    if (isRegionVerified && fullname && !fullname.match(/\w+\s\w+/)) {
      setNameErrorMsg("Please enter your full name separated by a space.");
      return false;
    } else {
      if (!tosChecked) {
        setTosError(true);
        return false;
      } else {
        setTosError(false);
      }
      setNameErrorMsg("");
    }

    if (!email) {
      setEmailErrorMsg("Please enter your email address.");
      return false;
    } else {
      setEmailErrorMsg("");
    }

    if (!password) {
      setPasswordErrorMsg("Please enter a password.");
      return false;
    } else {
      setPasswordErrorMsg("");
    }

    if (!tosChecked) {
      setPasswordErrorMsg("Please agree to the Terms of Service.");
      return false;
    }

    setUserErrorMsg("");
    return true;
  };

  const handleSignUp = async () => {
    if (!formIsValid()) return;

    const { nsec, pubkey } = await createNewNostrAccount(
      username
        ? {
            name: username,
          }
        : {},
    );

    if (!pubkey || !nsec) {
      toast.show("Something went wrong generating your pubkey.");
      return;
    }

    login(nsec);
    let firstName;
    let lastName;

    if (fullname) {
      firstName = fullname.split(" ")[0];
      lastName = fullname.split(" ")[1];
    }

    const userResult = await createUserWithEmail({
      email,
      password,
      firstName,
      lastName,
      username,
      pubkey,
    });

    if (typeof userResult?.error === "string") {
      setPasswordErrorMsg(userResult.error);
      return;
    }

    router.replace({
      pathname: "/auth/email-ver",
      params: {
        createdRandomNpub: "true",
      },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView behavior="padding" enabled>
        <ScrollView
          contentContainerStyle={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingVertical: 20,
            gap: 20,
          }}
        >
          <View style={{ marginVertical: 30 }}>
            <LogoIcon fill="white" width={130} height={108} />
          </View>
          <View
            style={{
              width: "100%",
            }}
          >
            {isRegionVerified && (
              <TextInput
                label="Full Name"
                autoCorrect={false}
                value={fullname}
                onChangeText={(value) => {
                  setFullname(value);
                  setNameErrorMsg("");
                }}
                errorMessage={nameErrorMsg}
              />
            )}
            <TextInput
              label="Email Address"
              autoCorrect={false}
              value={email}
              keyboardType="email-address"
              onChangeText={(value) => {
                setEmail(value);
                setEmailErrorMsg("");
              }}
              errorMessage={emailErrorMsg}
            />
            <TextInput
              label="Username"
              // disable password manager
              textContentType="none"
              autoCorrect={false}
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                setUserErrorMsg("");
              }}
              errorMessage={userErrorMsg}
            />
            <TextInput
              label="Password"
              secureTextEntry
              autoCorrect={false}
              value={password}
              keyboardType="visible-password"
              onChangeText={(value) => {
                setPassword(value);
                setPasswordErrorMsg("");
              }}
              errorMessage={passwordErrorMsg}
            />
            {isRegionVerified && (
              <>
                <AgreementCheckbox
                  checked={tosChecked}
                  onCheckChanged={setTosChecked}
                />
                {tosError && (
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: 4,
                      color: "red",
                    }}
                  >
                    Please agree to the Terms of Service.
                  </Text>
                )}
              </>
            )}
          </View>
          <Button
            color="white"
            onPress={async () => {
              setIsLoading(true);
              await handleSignUp();
              setIsLoading(false);
            }}
            loading={isLoading}
          >
            Sign Up
          </Button>
          <OrSeparator />
          <ExternalLoginProviders setIsLoading={setIsLoading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const AgreementCheckbox: React.FC<{
  checked: boolean;
  onCheckChanged: (checked: boolean) => void;
}> = ({ checked, onCheckChanged }) => {
  return (
    <View style={styles.container}>
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
              onPress={() => {
                Linking.openURL(WAVLAKE_TOS);
              }}
              style={{ color: brandColors.purple.DEFAULT }}
            >
              terms
            </Text>
            {" and "}
            <Text
              onPress={() => {
                Linking.openURL(ZBD_TOS);
              }}
              style={{ color: brandColors.purple.DEFAULT }}
            >
              payments
            </Text>
            {" policy."}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    textDecorationLine: "underline",
  },
});

export default SignUpPage;
