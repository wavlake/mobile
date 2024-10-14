import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Text, HeaderBackButton } from "@/components";
export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerBackTitleVisible: false,
        headerTitle: "",
        headerTitleAlign: "center",
        headerBackVisible: false,
        headerLeft: () => <HeaderBackButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "",
          headerBackVisible: false,
          headerLeft: undefined,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="nsec"
        options={{ headerTitle: () => <Text>Nsec</Text> }}
      />
      <Stack.Screen
        name="login"
        options={{ headerTitle: () => <Text>Login</Text> }}
      />
      <Stack.Screen
        name="signup"
        options={{ headerTitle: () => <Text>Sign Up</Text> }}
      />
      <Stack.Screen
        name="skip"
        options={{ headerTitle: () => <Text>Skip registration</Text> }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          headerTitle: () => <Text>Welcome</Text>,
          // Hide back button from header (null doesnt work)
          // disable back gesture on Android
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
