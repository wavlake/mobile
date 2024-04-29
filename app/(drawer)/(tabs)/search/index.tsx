import { Center, PillTabView, Text, GenresSection } from "@/components";

export default function SearchPage() {
  return (
    <PillTabView searchShown tabNames={["Music", "Shows"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <GenresSection />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <Center>
          <Text>Shows search coming soon</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
