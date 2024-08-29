import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { HeaderBackButton } from "@/components";

export default function ZapLayout() {
  const { colors } = useTheme();

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
        name="scanner"
        options={{
          presentation: "containedModal",
        }}
      />
      <Stack.Screen
        name="receive"
        options={{
          presentation: "containedModal",
        }}
      />
    </Stack>
  );
}
