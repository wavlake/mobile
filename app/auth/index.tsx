import { Center, Text, LogoIcon, Button } from "@/components";
import { Link, useRouter } from "expo-router";
import { View } from "react-native";
import { brandColors } from "@/constants";

export default function AuthPage() {
  const router = useRouter();

  return (
    <Center>
      <Text style={{ fontSize: 32 }} bold>
        Turn up the value.
      </Text>
      <View style={{ paddingVertical: 24 }}>
        <LogoIcon fill="white" width={130} height={108} />
      </View>
      <Button
        onPress={() => {
          router.push("/auth/signup");
        }}
      >
        Sign up
      </Button>
      <View style={{ marginTop: 16 }}>
        <Button
          onPress={() => {
            router.push("/auth/login");
          }}
          color={brandColors.pink.light}
        >
          Login
        </Button>
      </View>
      <View style={{ marginTop: 56, marginBottom: 32 }}>
        <Link href="/auth/skip">
          <Text style={{ fontSize: 18 }} bold>
            Skip registration
          </Text>
        </Link>
      </View>
    </Center>
  );
}
