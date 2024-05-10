import { Text, Button, TextInput } from "@/components";
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";
import { getSeckey, useAddPubkeyToUser } from "@/utils";
import { CopyButton } from "@/components/CopyButton";
import { useUser } from "@/components/UserContextProvider";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { DialogWrapper } from "@/components/DialogWrapper";

export default function Login() {
  const [nsec, setNsec] = useState("");
  const [isNewNsec, setIsNewNsec] = useState(false);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const { mutateAsync: addPubkeyToAccount } = useAddPubkeyToUser({});
  const { colors } = useTheme();
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

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
      <KeyboardAvoidingView
        behavior="position"
        style={{
          display: "flex",
          flexDirection: "column",
          paddingHorizontal: 24,
          paddingVertical: 20,
        }}
      >
        <Text style={{ fontSize: 18, paddingBottom: 10 }}>
          A Nostr private key (nsec) has been generated for you and is stored
          securely on this device. Your nsec is a secret and should never be
          shared with anyone.
        </Text>
        <Text style={{ fontSize: 18, paddingBottom: 10 }}>
          Alternatively, you can enter your own private key to use if you have
          one.
        </Text>
        <TouchableOpacity onPress={() => setIsInfoDialogOpen(true)}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 10,
            }}
          >
            <Text>What's an nsec?</Text>
            <Ionicons
              name="help-circle-outline"
              size={30}
              color={colors.text}
            />
          </View>
        </TouchableOpacity>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 20,
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
          <Text style={{ fontSize: 18 }}>
            Your private key will only be stored on your device and not on
            Wavlake systems. Wavlake will never have access to your key.
          </Text>
        </View>
        <InfoDialog isOpen={isInfoDialogOpen} setIsOpen={setIsInfoDialogOpen} />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

export const InfoDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
  return (
    <DialogWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Text bold style={{ fontSize: 18 }}>
          What is a Nostr private key (nsec)?
        </Text>
        <Text style={{ fontSize: 18 }}>
          You can access your private key from your profile page and back it up
          later if you are unable to back it up securely right now. Just keep in
          mind that Wavlake does not have access to your private key, so if log
          out of Wavlake without backing up your nsec first, you will lose
          access to your account.
        </Text>

        <Button
          style={{
            alignSelf: "center",
          }}
          onPress={() => setIsOpen(false)}
        >
          OK
        </Button>
      </View>
    </DialogWrapper>
  );
};
