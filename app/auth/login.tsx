import { Text, Button, TextInput, Center } from "@/components";
import { Stack } from "expo-router";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { useAuth } from "@/hooks";

export default function Login() {
  const [nsec, setNsec] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { goToRoot, login } = useAuth();

  const handleLogin = async () => {
    const success = await login(nsec);

    if (success) {
      await goToRoot();
    } else {
      setErrorMessage("Invalid nostr nsec");
    }

    setIsLoggingIn(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Login" }} />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <Center style={{ paddingHorizontal: 36 }}>
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
            onPress={handleLogin}
            disabled={isLoggingIn}
            loading={isLoggingIn}
          >
            Register
          </Button>
          <View style={{ marginTop: 80 }}>
            <Text style={{ fontSize: 18 }}>
              Your private key will only be stored on your device and not on
              Wavlake systems. Wavlake will never have access to your key.
            </Text>
          </View>
        </Center>
      </TouchableWithoutFeedback>
    </>
  );
}
