import { PillTabView, Text, Center } from "../../components";

export default function HomePage() {
  return (
    <PillTabView>
      <PillTabView.Item style={{ backgroundColor: "#ffb848", width: "100%" }}>
        <Center>
          <Text>New and trending music</Text>
        </Center>
      </PillTabView.Item>
      <PillTabView.Item style={{ backgroundColor: "gray", width: "100%" }}>
        <Center>
          <Text>New and trending podcasts</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
