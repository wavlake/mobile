import { PillTabView, PulseUserActivityFeed } from "@/components";
import { PulseGlobalActivityFeed } from "@/components/PulseGlobalActivityFeed";
import { useState } from "react";

export default function PulsePage() {
  // global loads slowly and blocks UI interaction on the default Feed tab
  // so we need to show a loader
  const [isLoading, setIsLoading] = useState(true);
  return (
    <PillTabView tabNames={["Feed", "Global"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <PulseUserActivityFeed externalLoading={isLoading} />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <PulseGlobalActivityFeed setIsLoading={setIsLoading} />
      </PillTabView.Item>
    </PillTabView>
  );
}
