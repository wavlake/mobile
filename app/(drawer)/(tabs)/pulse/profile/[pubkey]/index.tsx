import { ScrollView, View } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { useLocalSearchParams } from "expo-router";
import {
  PubkeyPlaylists,
  PubkeyProfile,
  Center,
  Text,
  ActivityItemRow,
} from "@/components/";
import { useCatalogPubkey } from "@/hooks/nostrProfile/useCatalogPubkey";
import { RefreshControl } from "react-native-gesture-handler";
import { usePubkeyActivity } from "@/hooks/usePubkeyActivity";

export default function PulseProfilePage() {
  const { pubkey } = useLocalSearchParams();

  if (!pubkey || typeof pubkey !== "string" || pubkey.length !== 64) {
    return (
      <Center>
        <Text>Invalid pubkey</Text>
        <Text>{pubkey}</Text>
      </Center>
    );
  }

  return <PubkeyProfilePage pubkey={pubkey} />;
}

const NUM_ACTIVITY_ROWS = 3;
const PubkeyProfilePage = ({ pubkey }: { pubkey: string }) => {
  const {
    data: profileData,
    isLoading: metadataLoading,
    refetch: refetchMetadata,
  } = useCatalogPubkey(pubkey as string);
  const {
    data: activity = [],
    isLoading: activityLoading,
    refetch: refetchActivity,
  } = usePubkeyActivity(pubkey as string);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={metadataLoading || activityLoading}
          onRefresh={() => {
            refetchMetadata();
            refetchActivity();
          }}
        />
      }
    >
      {profileData && <PubkeyProfile profileData={profileData} />}
      <View
        style={{
          paddingHorizontal: 16,
        }}
      >
        <PubkeyPlaylists pubkey={pubkey} maxRows={3} />
        <SectionHeader
          title="Recent Activity"
          rightNavText="View All"
          rightNavHref={{
            pathname: `/pulse/profile/${pubkey}/activity`,
            params: {
              includeBackButton: true,
            },
          }}
        />
        {activity.slice(0, NUM_ACTIVITY_ROWS).map((item) => (
          <ActivityItemRow item={item} key={item.contentId + item.timestamp} />
        ))}
      </View>
    </ScrollView>
  );
};
