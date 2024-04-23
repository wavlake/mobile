import { PillTabView, HomePageMusic, HomePageShows } from "@/components";

export default function HomePage() {
  return (
    <PillTabView tabNames={["Music", "Shows"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <HomePageMusic />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <HomePageShows />
      </PillTabView.Item>
    </PillTabView>
  );
}
