import { Text, Button, TextInput, Center } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { useAuth } from "@/hooks";
import { Link, useRouter } from "expo-router";

export default function Login() {
  const [nsec, setNsec] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { goToRoot, login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoggingIn(true);

    const success = await login(nsec);

    if (success) {
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
          onPress={() => {
            router.push("/auth/nsec");
          }}
        >
          Google
        </Button>
        <Button
          onPress={() => {
            router.push("/auth/nsec");
          }}
        >
          Twitter
        </Button>
        <Button
          onPress={() => {
            router.push("/auth/nsec");
          }}
        >
          Nostr
        </Button>
        <Link href="/auth/skip">
          <Text style={{ fontSize: 18 }} bold>
            Skip for now
          </Text>
        </Link>
      </Center>
    </TouchableWithoutFeedback>
  );
}
