import { Avatar, Button, Center, Text } from "@/components";
import { View } from "react-native";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { Link, useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { generateRandomName } from "@/utils/user";
import { useState } from "react";

export default function WelcomePage() {
  const { login, pubkey } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const router = useRouter();
  const { catalogUser } = useUser();

  const createNewNostrAccount = useCreateNewNostrAccount();

  const goToHomePage = async () => {
    setIsLoggingIn(true);
    if (pubkey) {
      // we're already logged in with an nsec
      router.replace("/");
      setIsLoggingIn(false);
      return;
    }

    // if not, create a new nostr account and log in
    const nsec = await createNewNostrAccount({ name: generateRandomName() });
    const success = nsec && (await login(nsec));
    if (!success) {
      setErrorMessage(
        "Something went wrong logging you in. Please try again later.",
      );
      setIsLoggingIn(false);
      return;
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
        <Text
          onPress={() => {
            // replace with home page so that the profile page's back button doesn't go back to the welcome page
            router.replace("/");
            router.push("/profile");
          }}
          style={{ fontSize: 18 }}
          bold
        >
          Edit Profile
        </Text>
        <Button
          style={{
            marginVertical: 40,
          }}
          onPress={goToHomePage}
          loading={isLoggingIn}
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
        {!pubkey && (
          <Link href="/auth/nsec">
            <Text style={{ fontSize: 18 }} bold>
              Nostr user? Click here
            </Text>
          </Link>
        )}
      </View>
    </Center>
  );
}
