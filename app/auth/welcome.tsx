import { Button, Center, Text } from "@/components";
import { View } from "react-native";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { generateRandomName } from "@/utils/user";
import { useState } from "react";

export default function WelcomePage() {
  const { goToRoot, login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { catalogUser } = useUser();
  const goToSettings = () => {
    router.push("/");
    router.push("/settings");
  };
  const createNewNostrAccount = useCreateNewNostrAccount();

  const goToHomePage = async () => {
    const nsec = await createNewNostrAccount({ name: generateRandomName() });
    const success = nsec && (await login(nsec));
    if (success) {
      router.replace("/");
    } else {
      setErrorMessage(
        "Something went wrong logging you in. Please try again later.",
      );
    }
  };

  return (
    <Center>
      <View style={{ paddingHorizontal: 36, paddingBottom: 120 }}>
        <Text style={{ fontSize: 18 }}>Hi, {catalogUser?.name}</Text>

        <Text style={{ fontSize: 18 }}>Welcome to Wavlake!</Text>
      </View>
      <Button onPress={goToSettings}>Edit Profile</Button>
      <Button onPress={goToHomePage}>Start listening</Button>
      <Text
        style={{
          color: "red",
          textAlign: "center",
          marginTop: 20,
        }}
      >
        {errorMessage}
      </Text>
      <Button onPress={() => router.push("/auth/nsec")}>
        Nostr user? Click here
      </Button>
    </Center>
  );
}
