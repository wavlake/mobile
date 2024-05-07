import { Text, Button, TextInput, Center, LogoIcon } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { Link, useRouter } from "expo-router";
import { firebaseService } from "@/services";
import { generateRandomName } from "@/utils/user";
import { useUser } from "@/components/UserContextProvider";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { goToRoot, login } = useAuth();
  const { signInWithEmail, user, goToWelcome } = useUser();
  const createNewNostrAccount = useCreateNewNostrAccount();

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const result = await signInWithEmail(email, password);
    createNewNostrAccount({ name: generateRandomName() });
    // const success = await login(nsec);

    if (result.success) {
      router.replace("/auth/welcome");
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
          paddingVertical: 50,
        }}
      >
        <View style={{ marginVertical: 30 }}>
          <LogoIcon fill="white" width={130} height={108} />
        </View>
        <View
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignContent: "center",
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
            errorMessage={errorMessage}
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
          onPress={handleLogin}
        >
          Login
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
