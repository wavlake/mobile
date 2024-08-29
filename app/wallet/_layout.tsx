import { Stack } from "expo-router";
import { HeaderBackButton, Text } from "@/components";

export default function ZapLayout() {
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
        headerLeft: () => <HeaderBackButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Wallet</Text>,
        }}
      />
      <Stack.Screen
        name="scanner"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Send</Text>,
        }}
      />
      <Stack.Screen
        name="receive"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Receive</Text>,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          presentation: "card",
          headerTitle: () => <Text>History</Text>,
        }}
      />
      <Stack.Screen
        name="success"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Success</Text>,
        }}
      />
    </Stack>
  );
}
