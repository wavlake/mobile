import { Text, Button, TextInput, Center } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { generateRandomName } from "@/utils/user";
import { useUser } from "@/components/UserContextProvider";
import { useRouter } from "expo-router";
import { generatePrivateKey } from "@/utils";

export default function Login() {
  const [nsec, setNsec] = useState("");
  const [isNewNsec, setIsNewNsec] = useState(false);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { signInAnonymously, user } = useUser();
  const createNewNostrAccount = useCreateNewNostrAccount();

  const handleNewNsecPress = async () => {
    const seckey = generatePrivateKey();
    setNsec(seckey);
    setIsNewNsec(true);
  };

  const handleNsecSubmit = async () => {
    setIsLoggingIn(true);
    if (isNewNsec) {
      // if the user generated a new nsec, create a new nostr account for them
      await createNewNostrAccount({ name: generateRandomName() }, nsec);
    }

    // log in with the nsec (either newly created or provided)
    const success = await login(nsec);

    if (success) {
      // only sign in to firebase anonymously if a user is not already signed in
      !user && (await signInAnonymously());

      // add an artifical delay to allow time to fetch profile if it's not cached
      setTimeout(async () => {
        router.replace("/");
        setIsLoggingIn(false);
      }, 1000);
    } else {
      setErrorMessage("Invalid nostr nsec");
      setIsLoggingIn(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Center
        style={{
          alignContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 50,
        }}
      >
        <Text style={{ fontSize: 18, marginTop: 40 }}>
          Enter your private key (nsec) here:
        </Text>
        <TextInput
          label="nostr nsec"
          secureTextEntry
          autoCorrect={false}
          value={nsec}
          onChangeText={(value) => {
            // reset isNewNsec to false if the user changes the random nsec
            isNewNsec && setIsNewNsec(false);
            setNsec(value);
            setErrorMessage("");
          }}
          errorMessage={errorMessage}
        />
        <Button
          onPress={handleNsecSubmit}
          disabled={isLoggingIn}
          loading={isLoggingIn}
          style={{ marginTop: 20 }}
        >
          Save
        </Button>
        <Text style={{ marginTop: 20, fontSize: 18 }}>
          Your private key will only be stored on your device and not on Wavlake
          systems. Wavlake will never have access to your key.
        </Text>
        <Text style={{ fontSize: 18 }}>
          We can also generate a new, random key for you to use on this app.
        </Text>
        <Button
          color="gray"
          style={{
            marginTop: 20,
          }}
          onPress={handleNewNsecPress}
        >
          Generate New Key
        </Button>
        <View
          style={{
            flexGrow: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button color="gray" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>
      </Center>
    </TouchableWithoutFeedback>
  );
}
