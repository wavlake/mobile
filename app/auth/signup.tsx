import { Button, Center, TextInput } from "@/components";
import { Stack, useRouter } from "expo-router";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import { useCreateNewNostrAccount } from "@/hooks";

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const isCreateAccountButtonDisabled =
    username.length === 0 || isCreatingAccount;
  const createNewNostrAccount = useCreateNewNostrAccount();
  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    await createNewNostrAccount({ name: username });
    setIsCreatingAccount(false);
    router.push("/auth/backup-nsec");
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Signup" }} />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <Center style={{ paddingHorizontal: 36 }}>
          <View style={{ marginBottom: 24, width: "100%" }}>
            <TextInput
              label="username"
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <Button
            onPress={handleCreateAccount}
            disabled={isCreateAccountButtonDisabled}
            loading={isCreatingAccount}
          >
            Create Account
          </Button>
        </Center>
      </TouchableWithoutFeedback>
    </>
  );
}
