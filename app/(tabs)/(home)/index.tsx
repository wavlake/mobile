import {
  PillTabView,
  Text,
  Center,
  SectionHeader,
  NewBadgeIcon,
} from "../../../components";
import { brandColors } from "../../../constants";

export default function HomePage() {
  return (
    <PillTabView>
      <PillTabView.Item style={{ width: "100%" }}>
        <SectionHeader
          title="Out Now"
          icon={
            <NewBadgeIcon
              fill={brandColors.pink.DEFAULT}
              width={24}
              height={24}
            />
          }
          rightNavText="Discover"
          rightNavHref="/discover"
        />
      </PillTabView.Item>
      <PillTabView.Item style={{ backgroundColor: "gray", width: "100%" }}>
        <Center>
          <Text>New and trending podcasts</Text>
        </Center>
      </PillTabView.Item>
    </PillTabView>
  );
}
