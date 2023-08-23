import {
  PillTabView,
  Text,
  Center,
  NewMusicSection,
} from "../../../components";

export default function HomePage() {
  return (
    <PillTabView>
      <PillTabView.Item style={{ width: "100%" }}>
        <NewMusicSection />
      </PillTabView.Item>
      <PillTabView.Item style={{ backgroundColor: "gray", width: "100%" }}>
        <Center>
          <Text>New and trending podcasts</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
