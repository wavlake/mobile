import { Center, PillTabView, Text, GenresSection } from "@/components";

export default function SearchPage() {
  return (
    <PillTabView searchShown tabNames={["Music", "Podcasts"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <GenresSection />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <Center>
          <Text>Podcast search coming soon</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
