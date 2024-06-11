import { ScrollView, View, RefreshControl } from "react-native";
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
import { usePubkeyActivity } from "@/hooks/usePubkeyActivity";
import { useAuth } from "@/hooks";

export const PulseProfilePage = () => {
  const { pubkey } = useLocalSearchParams();
  const { pubkey: loggedInPubkey } = useAuth();

  // If no pubkey param, we are looking at the logged in user's profile
  const targetPubkey = pubkey ?? loggedInPubkey;

  if (
    !targetPubkey ||
    typeof targetPubkey !== "string" ||
    targetPubkey.length !== 64
  ) {
    return (
      <Center>
        <Text>Invalid pubkey</Text>
        <Text>{targetPubkey}</Text>
      </Center>
    );
  }

  return <PubkeyProfilePage pubkey={targetPubkey} />;
};

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
        {!!activity.length ? (
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
        ) : (
          <Center
            style={{
              paddingTop: 40,
            }}
          >
            <Text>This user has no activity</Text>
          </Center>
        )}
        {activity.slice(0, NUM_ACTIVITY_ROWS).map((item) => (
          <ActivityItemRow item={item} key={item.contentId + item.timestamp} />
        ))}
      </View>
    </ScrollView>
  );
};
