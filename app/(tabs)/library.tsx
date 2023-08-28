import { Center, PillTabView, Text } from "@/components";

export default function LibraryPage() {
  return (
    <PillTabView>
      <PillTabView.Item style={{ backgroundColor: "#ffb848", width: "100%" }}>
        <Center>
          <Text>Music library</Text>
        </Center>
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <Center>
          <Text>Podcast library coming soon</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
