import { useState } from "react";
import { Text, Button, TextInput, LogoIcon } from "@/components";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { ElementType } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { ZBDIcon } from "@/components/ZBDIcon";
import { TwitterIcon } from "@/components/TwitterIcon";
import { GoogleIcon } from "@/components/GoogleIcon";
import { NostrIcon } from "@/components/NostrIcon";
import { useToast } from "@/hooks";
import { ScrollView } from "react-native";

export const LoginSignUpForm = ({
  onSubmit,
  buttonText,
  setErrorMessage,
  errorMessage,
  isLoading,
}: {
  onSubmit: (email: string, password: string) => void;
  buttonText: string;
  setErrorMessage: (message: string) => void;
  errorMessage: string;
  isLoading: boolean;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        style={{
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
          onPress={() => onSubmit(email, password)}
          loading={isLoading}
        >
          {buttonText}
        </Button>
        <OrSeparator />
        <LoginProviders />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

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
  const [error, setError] = useState("");
  const { signInWithGoogle } = useUser();
  const { show } = useToast();
  const providers = [
    {
      name: "Google",
      icon: GoogleIcon,
      onPress: async () => {
        const result = await signInWithGoogle();
        if ("error" in result) {
          setError(result.error);
          show("Failed to sign in with Google");
        } else {
          router.push({
            pathname: "/auth/welcome",
          });
        }
      },
    },
    // TODO: implement these providers
    // {
    //   name: "Twitter",
    //   icon: TwitterIcon,
    //   onPress: async () => {
    //     // signInWithTwitter
    //   },
    // },
    // {
    //   name: "ZBD",
    //   icon: ZBDIcon,
    //   onPress: async () => {
    //     // router.push("/auth/nsec");
    //   },
    // },
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
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
};
const OrSeparator = () => (
  <View
    style={{
      marginVertical: 20,
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
