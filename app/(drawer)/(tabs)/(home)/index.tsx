import { PillTabView, HomePageMusic, HomePagePodcasts } from "@/components";

export default function HomePage() {
  return (
    <PillTabView tabNames={["Music", "Podcasts"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <HomePageMusic />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <HomePagePodcasts />
      </PillTabView.Item>
    </PillTabView>
  );
}
