import {
  PillTabView,
  Text,
  Center,
  NewMusicSection,
  TopMusicSection,
} from "@/components";
import { ScrollView } from "react-native";

export default function HomePage() {
  return (
    <PillTabView searchShown>
      <PillTabView.Item style={{ width: "100%" }}>
        <ScrollView>
          <NewMusicSection />
          <TopMusicSection />
        </ScrollView>
      </PillTabView.Item>
      <PillTabView.Item style={{ backgroundColor: "gray", width: "100%" }}>
        <Center>
          <Text>New and trending podcasts</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
