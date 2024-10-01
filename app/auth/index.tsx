import { Text, Button, Center, LogoIcon } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Link, useRouter } from "expo-router";
import { useRegionCheck } from "@/hooks/useRegionCheck";

export default function InitialPage() {
  const router = useRouter();
  const {
    isLoading: regionChecking,
    data: isAllowed = true,
    refetch,
  } = useRegionCheck({ enabled: true });

  const handleLogin = async () => {
    router.push("/auth/login");
  };

  const handleSignUp = async () => {
    if (regionChecking) {
      // If the region check is still loading, wait for it to complete
      await refetch();
    }

    router.push({
      pathname: "/auth/signup",
      params: {
        isRegionVerified: isAllowed ? "true" : "false",
      },
    });
  };

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
          <Button color="white" onPress={handleSignUp}>
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
