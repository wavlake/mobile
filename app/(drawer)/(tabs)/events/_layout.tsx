import { PillTabView } from "@/components";
import { TicketListPage } from "@/components/TicketEvents/TicketListPage";
import { Stack } from "expo-router";

export default function EventsLayout() {
  return (
    <PillTabView tabNames={["Events", "Tickets"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <Stack
          screenOptions={{
            headerBackTitleVisible: false,
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="tickets" />
        </Stack>
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <TicketListPage />
      </PillTabView.Item>
    </PillTabView>
  );
}
