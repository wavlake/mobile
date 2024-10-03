import React, { useState } from "react";
import {
  Button,
  TextInput,
  OrSeparator,
  ExternalLoginProviders,
  LogoIcon,
} from "@/components";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { useAuth } from "@/hooks";

export default function Login() {
  const router = useRouter();
  const { pubkey } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const { signInWithEmail } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (email: string, password: string) => {
    const result = await signInWithEmail(email, password);
    if ("error" in result) {
      setErrorMessage(result.error);
      return;
    }
    // if the user isn't pubkey-logged in via signInWithEmail above
    // we need to collect their previously used nsec
    if (!pubkey) {
      router.push({
        pathname: "/auth/nsec",
        params: {
          createdRandomNpub: result.createdRandomNpub ? "true" : "false",
          userAssociatedPubkey: result.userAssociatedPubkey,
        },
      });
    } else {
      router.replace({
        pathname: "/auth/welcome",
        params: {
          createdRandomNpub: result.createdRandomNpub ? "true" : "false",
        },
      });
    }
  };

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
            label="Email Address"
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
            await handleLogin(email, password);
            setIsLoading(false);
          }}
          loading={isLoading}
        >
          Login
        </Button>
        <OrSeparator />
        <ExternalLoginProviders setIsLoading={setIsLoading} />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
