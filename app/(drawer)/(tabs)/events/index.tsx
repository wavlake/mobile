import { PillTabView, EventListPage } from "@/components";
import { TicketListPage } from "@/components/TicketEvents/TicketListPage";

export default function EventsPage() {
  return (
    <PillTabView tabNames={["Events", "Tickets"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <EventListPage />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <TicketListPage />
      </PillTabView.Item>
    </PillTabView>
  );
}
