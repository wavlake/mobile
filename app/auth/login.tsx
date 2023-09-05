import { Center, Text } from "@/components";
import { Stack } from "expo-router";

export default function Login() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Login" }} />
      <Center>
        <Text>Login coming soon...</Text>
      </Center>
    </>
  );
}
