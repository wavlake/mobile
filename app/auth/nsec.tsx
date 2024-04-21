import { Text, Button, TextInput, Center } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { generateRandomName } from "@/utils/user";
import { useUser } from "@/components/UserContextProvider";

export default function Login() {
  const [nsec, setNsec] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { goToRoot, login } = useAuth();
  const { signInAnonymously, user, goToWelcome } = useUser();
  const createNewNostrAccount = useCreateNewNostrAccount();

  const handleNewNsecPress = async () => {
    setIsLoggingIn(true);

    await createNewNostrAccount({ name: generateRandomName() });
    await signInAnonymously();

    setIsLoggingIn(false);
    goToRoot();
  };

  const handleNsecSubmit = async () => {
    setIsLoggingIn(true);

    const success = await login(nsec);

    if (success) {
      await signInAnonymously();
      // add an artifical delay to allow time to fetch profile if it's not cached
      setTimeout(async () => {
        await goToRoot();
        setIsLoggingIn(false);
      }, 1000);
    } else {
      setErrorMessage("Invalid nostr nsec");
      setIsLoggingIn(false);
    }
  };

  if (user) {
    goToWelcome();
  }
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Center style={{ paddingHorizontal: 24 }}>
        <View style={{ marginBottom: 24, width: "100%" }}>
          <TextInput
            label="nostr nsec"
            secureTextEntry
            autoCorrect={false}
            value={nsec}
            onChangeText={(value) => {
              setNsec(value);
              setErrorMessage("");
            }}
            errorMessage={errorMessage}
          />
        </View>
        <Button
          onPress={handleNsecSubmit}
          disabled={isLoggingIn}
          loading={isLoggingIn}
        >
          Save
        </Button>
        <View style={{ marginTop: 80 }}>
          <Text style={{ fontSize: 18 }}>
            Your private key will only be stored on your device and not on
            Wavlake systems. Wavlake will never have access to your key.
          </Text>
          <Text style={{ fontSize: 18 }}>
            We can also generate a new, random key for you to use on this app.
          </Text>
        </View>
        <Button color="white" onPress={handleNewNsecPress}>
          Generate New Key
        </Button>
      </Center>
    </TouchableWithoutFeedback>
  );
}
