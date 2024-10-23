import { Stack } from "expo-router";
import { Text, HeaderBackButton } from "@/components";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "black",
        },
        headerShadowVisible: false,
        headerTintColor: "white",
        headerBackTitleVisible: false,
        headerTitleAlign: "center",
        headerBackVisible: false,
        headerLeft: () => <HeaderBackButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Settings</Text>,
        }}
      />
      <Stack.Screen
        name="advanced"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Advanced Settings</Text>,
        }}
      />
      <Stack.Screen
        name="backup-nsec"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Nostr Key</Text>,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Update Profile</Text>,
        }}
      />
    </Stack>
  );
}
