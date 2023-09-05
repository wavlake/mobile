import { Center, Text } from "@/components";
import { Stack } from "expo-router";

export default function Signup() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Sign up" }} />
      <Center>
        <Text>Sign up coming soon..</Text>
      </Center>
    </>
  );
}
