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
        name="withdraw"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Withdraw</Text>,
        }}
      />
      <Stack.Screen
        name="fund"
        options={{
          presentation: "card",
          headerTitle: () => <Text>Fund</Text>,
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
