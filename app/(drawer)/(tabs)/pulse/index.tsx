import { PillTabView, PulseUserActivityFeed } from "@/components";
import { PulseGlobalActivityFeed } from "@/components/PulseGlobalActivityFeed";

export default function PulsePage() {
  return (
    <PillTabView tabNames={["Feed", "Global"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <PulseUserActivityFeed />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <PulseGlobalActivityFeed />
      </PillTabView.Item>
    </PillTabView>
  );
}
