import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Text } from "@/components";

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
      }}
    >
      <Stack.Screen
        name="backup-nsec"
        options={{ headerTitle: () => <Text>Backup nsec</Text> }}
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
          headerLeft: () => <Text />,
          // disable back gesture on Android
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
