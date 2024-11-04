import { Button, Center, Text } from "@/components";
import { ActivityIndicator, View } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { LoggedInUserAvatar } from "@/components/LoggedInUserAvatar";
import { useEffect } from "react";
import { setSkipLogin } from "@/utils";
import { useAuth, useNostrProfileEvent, useUser } from "@/hooks";

export default function WelcomePage() {
  // the user has successfully logged in
  // don't force the login page anymore
  useEffect(() => {
    setSkipLogin();
  }, []);

  const { nostrOnlyLogin: nostrOnlyLoginString } = useLocalSearchParams<{
    nostrOnlyLogin: "true" | "false";
  }>();
  const nostrOnlyLogin = nostrOnlyLoginString === "true";
  const router = useRouter();
  const { catalogUser } = useUser();
  const { pubkey } = useAuth();
  const { data: userProfile, isFetching } = useNostrProfileEvent(pubkey);
  const userName = nostrOnlyLogin ? userProfile?.name : catalogUser?.name;
  const goToHomePage = async () => {
    router.replace("/");
  };

  if (isFetching) {
    return (
      <Center>
        <ActivityIndicator />
      </Center>
    );
  }
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
        <LoggedInUserAvatar size={100} />
        {userName && <Text style={{ fontSize: 18 }}>Hi, {userName}</Text>}
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
      </View>
    </Center>
  );
}
