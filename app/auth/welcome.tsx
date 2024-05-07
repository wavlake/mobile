import { Avatar, Button, Center, Text } from "@/components";
import { View } from "react-native";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { Link, useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { generateRandomName } from "@/utils/user";
import { useState } from "react";

export default function WelcomePage() {
  const { goToRoot, login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { catalogUser } = useUser();

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
    <Center
      style={{
        paddingHorizontal: 24,
        paddingVertical: 50,
      }}
    >
      <View
        style={{
          paddingHorizontal: 36,
          paddingVertical: 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <Avatar size={100} />
        <Text style={{ fontSize: 18 }}>Hi, {catalogUser?.name}</Text>
        <Text style={{ fontSize: 18 }}>Welcome to Wavlake!</Text>
      </View>
      <View
        style={{
          flexGrow: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {/* <Link href="/profile">
          <Text style={{ fontSize: 18 }} bold>
            Edit Profile
          </Text>
        </Link> */}
        <Button
          style={{
            marginVertical: 40,
          }}
          onPress={goToHomePage}
        >
          Start listening
        </Button>
        <Text
          style={{
            color: "red",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          {errorMessage}
        </Text>
        <Link href="/auth/nsec">
          <Text style={{ fontSize: 18 }} bold>
            Nostr user? Click here
          </Text>
        </Link>
      </View>
    </Center>
  );
}
