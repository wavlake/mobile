import { Text, Button, Center, LogoIcon } from "@/components";
import { View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Link, useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  const handleLogin = async () => {
    router.push("/auth/login");
  };

  const handleSignUp = async () => {
    router.push("/auth/signup");
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
