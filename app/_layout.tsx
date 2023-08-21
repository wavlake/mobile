import { Stack } from "expo-router";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { HeaderTitleLogo } from "../components";

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from "expo-router";

export default function Layout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "black",
          },
          headerShadowVisible: false,
          headerTitle: HeaderTitleLogo,
        }}
      />
    </ThemeProvider>
  );
}
