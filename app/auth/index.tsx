import { Text, Button, TextInput, Center, LogoIcon } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState } from "react";
import { useAuth } from "@/hooks";
import { Link, useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";

export default function Login() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { goToRoot, login } = useAuth();

  const handleLogin = async () => {
    router.push("/auth/login");
  };

  const handleSignUp = async () => {
    router.push("/auth/signup");
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

        <Button
          color="white"
          style={{
            marginTop: 20,
          }}
          loading={isLoggingIn}
          onPress={handleLogin}
        >
          Login
        </Button>
        <Button
          color="white"
          style={{
            marginVertical: 20,
          }}
          onPress={handleSignUp}
        >
          Sign Up
        </Button>
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
  const { signInWithGoogle } = useUser();
  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    user && router.push("/auth/welcome");
  };

  return (
    <View
      style={{
        gap: 20,
        marginVertical: 20,
      }}
    >
      <Button color="white" onPress={handleGoogleSignIn}>
        Google
      </Button>
      <Button
        color="white"
        // onPress={musicService.signInWithTwitter}
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
