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
      <PillTabView.Item style={{ width: "100%" }}>
        <Center>
          <Text>New and trending shows coming soon</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
