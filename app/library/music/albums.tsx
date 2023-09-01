import { Center, Text } from "@/components";
import { Stack } from "expo-router";

export default function AlbumsPage() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Albums" }} />
      <Center>
        <Text>Albums page</Text>
      </Center>
    </>
  );
}
