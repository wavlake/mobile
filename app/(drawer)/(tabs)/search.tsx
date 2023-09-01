import { Center, PillTabView, Text } from "@/components";

export default function SearchPage() {
  return (
    <PillTabView searchShown>
      <PillTabView.Item style={{ backgroundColor: "#ffb848", width: "100%" }}>
        <Center>
          <Text>Music search</Text>
        </Center>
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <Center>
          <Text>Podcast search coming soon</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
