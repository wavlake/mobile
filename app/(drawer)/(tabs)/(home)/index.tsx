import { PillTabView, Text, Center, HomePageMusic } from "@/components";

export default function HomePage() {
  return (
    <PillTabView searchShown>
      <PillTabView.Item style={{ width: "100%" }}>
        <HomePageMusic />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <Center>
          <Text>New and trending shows coming soon</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
