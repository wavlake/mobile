import { Button, Center, Text } from "@/components";
import { View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@/components/UserContextProvider";
import { LoggedInUserAvater } from "@/components/LoggedInUserAvater";

export default function WelcomePage() {
  const { newNpub } = useLocalSearchParams<{
    newNpub: "true" | "false";
  }>();
  const router = useRouter();
  const { catalogUser } = useUser();

  const goToHomePage = async () => {
    router.replace("/");
  };

  const showNostrLoginLink = newNpub === "true";
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
        <LoggedInUserAvater size={100} />
        <Text style={{ fontSize: 18 }}>Hi, {catalogUser?.name}</Text>
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
        <Button onPress={goToHomePage}>Start listening</Button>
        {showNostrLoginLink && (
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
