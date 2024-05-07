import { Text, Button, TextInput, Center, LogoIcon } from "@/components";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { ElementType, PropsWithChildren, useState } from "react";
import { useAuth } from "@/hooks";
import { Link, useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { ZBDIcon } from "@/components/ZBDIcon";
import { TwitterIcon } from "@/components/TwitterIcon";
import { GoogleIcon } from "@/components/GoogleIcon";
import { NostrIcon } from "@/components/NostrIcon";
import { TouchableWithoutFeedbackProps } from "react-native-gesture-handler";

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
            marginTop: 20,
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

const ProviderButton: React.FC<{ Icon: ElementType; onPress: () => void }> = ({
  Icon,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ backgroundColor: "white", padding: 10, borderRadius: 10 }}
  >
    <Icon fill="black" width={40} height={40} />
  </TouchableOpacity>
);
const LoginProviders = () => {
  const router = useRouter();
  const { signInWithGoogle } = useUser();
  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    user && router.push("/auth/welcome");
  };

  const providers = [
    {
      name: "Google",
      icon: GoogleIcon,
      onPress: handleGoogleSignIn,
    },
    {
      name: "Twitter",
      icon: TwitterIcon,
      onPress: () => {
        // musicService.signInWithTwitter
      },
    },
    {
      name: "ZBD",
      icon: ZBDIcon,
      onPress: () => {
        router.push("/auth/nsec");
      },
    },
    {
      name: "Nostr",
      icon: NostrIcon,
      onPress: () => {
        router.push("/auth/nsec");
      },
    },
  ];

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 30,
      }}
    >
      {providers.map((provider) => (
        <ProviderButton
          key={provider.name}
          Icon={provider.icon}
          onPress={provider.onPress}
        />
      ))}
    </View>
  );
};
const OrSeparator = () => (
  <View
    style={{
      marginVertical: 50,
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
