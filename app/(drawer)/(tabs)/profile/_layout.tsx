import { Stack } from "expo-router";
import { Text } from "@/components";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitleVisible: false,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerTitle: () => <Text>Your Profile</Text> }}
      />
      <Stack.Screen
        name="edit"
        options={{ headerTitle: () => <Text>Edit Profile</Text> }}
      />
    </Stack>
  );
}
