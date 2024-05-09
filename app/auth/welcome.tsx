import { Avatar, Button, Center, Text } from "@/components";
import { View } from "react-native";
import { useAuth, useCreateNewNostrAccount } from "@/hooks";
import { Link, useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { generateRandomName } from "@/utils/user";
import { useMemo, useState } from "react";
import { useAssociatePubkeyWithUser } from "@/utils/authTokenApi";

export default function WelcomePage() {
  const { login, pubkey } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const randomUsername = useMemo(generateRandomName, []);
  const router = useRouter();
  const { catalogUser } = useUser();

  const { mutateAsync: addPubkeyToAccount } = useAssociatePubkeyWithUser({});
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
    const { nsec, pubkey: newPubkey } = await createNewNostrAccount({
      name: randomUsername,
      image: catalogUser?.artworkUrl ?? "",
    });
    if (!newPubkey || !nsec) {
      setErrorMessage(
        "Something went wrong logging you in. Please try again later.",
      );
      setIsLoggingIn(false);
      return;
    }
    const success = await login(nsec);

    if (!success) {
      setErrorMessage(
        "Something went wrong logging you in. Please try again later.",
      );
      setIsLoggingIn(false);
      return;
    }

    // associate the pubkey to the firebase userID
    await addPubkeyToAccount(newPubkey);

    router.replace("/");
    setIsLoggingIn(false);
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
        <Avatar size={100} imageUrl={catalogUser?.artworkUrl} />
        <Text style={{ fontSize: 18 }}>
          Hi, {catalogUser?.name ?? randomUsername}
        </Text>
        <Text style={{ fontSize: 18 }}>Welcome to Wavlake!</Text>
      </View>
      <View
        style={{
          flexGrow: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 30,
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
        <Button onPress={goToHomePage} loading={isLoggingIn}>
          Start listening
        </Button>
        <Text
          style={{
            color: "red",
            textAlign: "center",
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
