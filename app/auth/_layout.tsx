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
        headerTitle: "",
      }}
    >
      <Stack.Screen
        name="backup-nsec"
        options={{ headerTitle: () => <Text>Backup nsec</Text> }}
      />
      <Stack.Screen
        name="login"
        options={{ headerTitle: () => <Text>Login</Text> }}
      />
      <Stack.Screen
        name="signup"
        options={{ headerTitle: () => <Text>Signup</Text> }}
      />
      <Stack.Screen
        name="skip"
        options={{ headerTitle: () => <Text>Skip registration</Text> }}
      />
    </Stack>
  );
}
