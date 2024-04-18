import { Text, Button, TextInput, Center, LogoIcon } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { useAuth } from "@/hooks";
import { Link, useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { goToRoot, login } = useAuth();

  const handleLogin = async () => {
    setIsLoggingIn(true);

    // const success = await login(nsec);

    if (false) {
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
          }}
        >
          <Text
            style={{ fontSize: 18, textAlign: "center", marginBottom: 10 }}
            bold
          >
            Login or Sign Up
          </Text>
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
        <OrSeparator />
        <LoginProviders />
        <View
          style={{
            flexGrow: 1,
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <Link href="/auth/skip">
            <Text style={{ fontSize: 18 }} bold>
              Skip for now
            </Text>
          </Link>
        </View>
      </Center>
    </TouchableWithoutFeedback>
  );
}

const LoginProviders = () => {
  const router = useRouter();
  return (
    <View
      style={{
        gap: 20,
        marginVertical: 20,
      }}
    >
      <Button
        color="white"
        onPress={() => {
          router.push("/auth/nsec");
        }}
      >
        Google
      </Button>
      <Button
        color="white"
        onPress={() => {
          router.push("/auth/nsec");
        }}
      >
        Twitter
      </Button>
      <Button
        color="white"
        onPress={() => {
          router.push("/auth/nsec");
        }}
      >
        Nostr
      </Button>
    </View>
  );
};
const OrSeparator = () => (
  <View
    style={{
      flexDirection: "row",
      gap: 15,
      alignItems: "center",
    }}
  >
    <View
      style={{
        borderBottomColor: "white",
        borderBottomWidth: 1,
        flexGrow: 1,
      }}
    />
    <Text style={{ fontSize: 18 }}>or</Text>
    <View
      style={{
        borderBottomColor: "white",
        borderBottomWidth: 1,
        flexGrow: 1,
      }}
    />
  </View>
);
