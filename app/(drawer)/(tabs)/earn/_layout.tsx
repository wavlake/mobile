import { Stack } from "expo-router";

export default function ListenToEarnLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitleVisible: false,
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
