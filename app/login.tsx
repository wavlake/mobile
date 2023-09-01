import { Center, Text } from "@/components";
import { Link, Stack } from "expo-router";
import { View } from "react-native";

export default function LoginPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Center>
        <Text>Login Page coming soon...</Text>
        <View style={{ marginTop: 24 }}>
          <Link href="../">
            <Text>Go back</Text>
          </Link>
        </View>
      </Center>
    </>
  );
}
