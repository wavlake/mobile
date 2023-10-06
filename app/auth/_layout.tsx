import { Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";

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
        options={{ headerTitle: "Backup nsec" }}
      />
      <Stack.Screen name="login" options={{ headerTitle: "Login" }} />
      <Stack.Screen name="signup" options={{ headerTitle: "Signup" }} />
      <Stack.Screen
        name="skip"
        options={{ headerTitle: "Skip registration" }}
      />
    </Stack>
  );
}
