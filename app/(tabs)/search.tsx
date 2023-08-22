import { Center, PillTabView, Text } from "../../components";

export default function SearchPage() {
  return (
    <PillTabView>
      <PillTabView.Item style={{ backgroundColor: "#ffb848", width: "100%" }}>
        <Center>
          <Text>Music search</Text>
        </Center>
      </PillTabView.Item>
      <PillTabView.Item style={{ backgroundColor: "gray", width: "100%" }}>
        <Center>
          <Text>Podcast search</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
