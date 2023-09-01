import { Center, Text } from "@/components";
import { Stack } from "expo-router";

export default function PlaylistsPage() {
  return (
    <>
      <Stack.Screen options={{ headerTitle: "Playlists" }} />
      <Center>
        <Text>Playlists page</Text>
      </Center>
    </>
  );
}
