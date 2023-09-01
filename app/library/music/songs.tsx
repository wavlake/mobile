import { Center, Text } from "@/components";
import { Stack } from "expo-router";

export default function SongsPage() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Songs" }} />
      <Center>
        <Text>Songs page</Text>
      </Center>
    </>
  );
}
