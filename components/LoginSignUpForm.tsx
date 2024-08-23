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
import { useAuth, useToast } from "@/hooks";
import { ScrollView } from "react-native";

export const LoginSignUpForm = ({
  onSubmit,
  buttonText,
  setErrorMessage,
  errorMessage,
}: {
  onSubmit: (email: string, password: string) => void;
  buttonText: string;
  setErrorMessage: (message: string) => void;
  errorMessage: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        contentContainerStyle={{
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
            keyboardType="email-address"
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
            keyboardType="visible-password"
            onChangeText={(value) => {
              setPassword(value);
              setErrorMessage("");
            }}
            errorMessage={errorMessage}
          />
        </View>
        <Button
          color="white"
          onPress={async () => {
            setIsLoading(true);
            await onSubmit(email, password);
            setIsLoading(false);
          }}
          loading={isLoading}
        >
          {buttonText}
        </Button>
        <OrSeparator />
        <LoginProviders setIsLoading={setIsLoading} />
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

const LoginProviders = ({
  setIsLoading,
}: {
  setIsLoading: (loading: boolean) => void;
}) => {
  const router = useRouter();
  const { pubkey } = useAuth();
  const { signInWithGoogle } = useUser();
  const { show } = useToast();
  const providers = [
    {
      name: "Google",
      icon: GoogleIcon,
      onPress: async () => {
        setIsLoading(true);
        const result = await signInWithGoogle();
        if ("error" in result) {
          show(result.error);
        } else {
          if (result.hasExistingNostrProfile && !pubkey) {
            router.push({
              pathname: "/auth/nsec-login",
            });
          } else {
            // we already auto-created them an nsec, or they were already logged in before
            router.replace({
              pathname: "/auth/welcome",
            });
          }
        }
        setIsLoading(false);
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
        setIsLoading(true);
        router.push("/auth/nsec");
        setIsLoading(false);
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
