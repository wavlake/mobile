import { Center, Text } from "@/components";
import { Stack } from "expo-router";

export default function ArtistsPage() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Artists" }} />
      <Center>
        <Text>Artists page</Text>
      </Center>
    </>
  );
}
