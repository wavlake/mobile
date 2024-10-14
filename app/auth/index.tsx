import { Text, Button, Center, LogoIcon } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Link, useRouter } from "expo-router";
import { useRegionCheck } from "@/hooks/useRegionCheck";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

export default function InitialPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const { refetch } = useRegionCheck({ enabled: false });
  const handleLogin = async () => {
    router.push("/auth/login");
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    const isAllowed = await refetch();
    await router.push({
      pathname: "/auth/signup",
      params: {
        isRegionVerified: isAllowed ? "true" : "false",
      },
    });
    setIsLoading(false);
  };

  // Prevents user from going back, user must choose an option on page
  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        e.preventDefault();
      }),
    [navigation],
  );

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <Center
        style={{
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          <View style={{ marginVertical: 30 }}>
            <LogoIcon fill="white" width={130} height={108} />
          </View>
          <Button color="white" onPress={handleLogin}>
            Login
          </Button>
          <Button color="white" onPress={handleSignUp} loading={isLoading}>
            Sign Up
          </Button>
        </View>
        <Link
          href="/auth/skip"
          style={{
            marginBottom: 60,
          }}
        >
          <Text style={{ fontSize: 18 }} bold>
            Skip for now
          </Text>
        </Link>
      </Center>
    </TouchableWithoutFeedback>
  );
}
