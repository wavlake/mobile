import { Text, Button, TextInput, Center } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { useState } from "react";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";
import { getSeckey, useAddPubkeyToUser } from "@/utils";
import { CopyButton } from "@/components/CopyButton";

export default function Login() {
  const [nsec, setNsec] = useState("");
  const [isNewNsec, setIsNewNsec] = useState(false);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { mutateAsync: addPubkeyToAccount } = useAddPubkeyToUser({});

  const handleNsecSubmit = async () => {
    const savedSecKey = await getSeckey();
    if (savedSecKey === nsec) {
      // if the user is trying to log in with the same nsec, just log in
      router.replace("/");
      return;
    }

    setIsLoggingIn(true);
    // log in with the nsec on the form
    const success = await login(nsec);
    if (!success) {
      setErrorMessage("Invalid nostr nsec");
      setIsLoggingIn(false);
      return;
    }

    // add the new pubkey to user_pubkey table (this will delete the old associated pubkey from user_pubkey)
    await addPubkeyToAccount();

    // add an artifical delay to allow time to fetch profile if it's not cached
    setTimeout(async () => {
      router.replace("/");
      setIsLoggingIn(false);
    }, 1000);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Center
        style={{
          alignContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 50,
          gap: 20,
        }}
      >
        <Text style={{ fontSize: 18 }}>
          This is your current private key. Back this up if you want to continue
          using this identity. This key will always be available in your
          Settings if you want to save it later.
          {"\n"}
          You can also enter your own private key to use if you have one.
          {"\n"}
          Your private key will only be stored on your device and not on Wavlake
          systems. Wavlake will never have access to your key.
        </Text>
        <View
          style={{
            flexGrow: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <TextInput
            label="nsec"
            secureTextEntry
            autoCorrect={false}
            value={nsec}
            onChangeText={(value) => {
              // reset isNewNsec to false if the user changes the random nsec
              isNewNsec && setIsNewNsec(false);
              setNsec(value);
              setErrorMessage("");
            }}
            errorMessage={errorMessage}
            rightIcon={<CopyButton value={nsec} />}
          />
          <Button
            onPress={handleNsecSubmit}
            disabled={isLoggingIn}
            loading={isLoggingIn}
          >
            Save
          </Button>
          <Button color="lightgray" onPress={() => router.back()}>
            Cancel
          </Button>
        </View>
      </Center>
    </TouchableWithoutFeedback>
  );
}
