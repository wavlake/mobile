import { Button, Center, LogoIcon, Text, TextInput } from "@/components";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { useUser } from "@/components/UserContextProvider";
import { Link } from "expo-router";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { goToRoot, login } = useAuth();
  const { createUserWithEmail, user, goToWelcome } = useUser();
  const createNewNostrAccount = useCreateNewNostrAccount();

  const handleSignUp = async () => {
    setIsLoggingIn(true);
    const result = await createUserWithEmail(email, password);
    // createNewNostrAccount({ name: generateRandomName() });
    // const success = await login(nsec);

    if (result.success) {
      // add an artifical delay to allow time to fetch profile if it's not cached
      setTimeout(async () => {
        await goToRoot();
        setIsLoggingIn(false);
      }, 1000);
    } else {
      setErrorMessage(result.error);
      setIsLoggingIn(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Center
        style={{
          paddingHorizontal: 24,
          alignContent: "center",
          paddingBottom: 50,
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
          <TextInput
            label="Email"
            autoCorrect={false}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage("");
            }}
          />
          <TextInput
            label="Password"
            secureTextEntry
            autoCorrect={false}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrorMessage("");
            }}
            errorMessage={errorMessage}
          />
        </View>
        <Button
          color="white"
          style={{
            marginVertical: 20,
          }}
          onPress={handleSignUp}
        >
          Sign Up
        </Button>
        <View
          style={{
            flexGrow: 1,
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Link href="/auth">
            <Text style={{ fontSize: 18 }} bold>
              Back
            </Text>
          </Link>
        </View>
      </Center>
    </TouchableWithoutFeedback>
  );
}
