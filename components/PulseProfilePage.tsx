import { ScrollView, View, RefreshControl } from "react-native";
import { SectionHeader } from "./SectionHeader";
import { useLocalSearchParams } from "expo-router";
import { usePubkeyActivity } from "@/hooks/usePubkeyActivity";
import { useAuth, useDecodedProfile, useNostrProfile } from "@/hooks";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { Text } from "./shared/Text";
import { PubkeyProfile } from "./PubkeyProfile";
import { Center } from "./shared/Center";
import { PubkeyPlaylists } from "./PubkeyPlaylists";
import { ActivityItemRow } from "./ActivityItemRow";

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
  const basePath = useGetBasePathname();
  const {
    data: profile,
    isLoading: metadataIsLoading,
    refetch: refetchMetadata,
  } = useDecodedProfile(pubkey);
  const {
    data: activity = [],
    isLoading: activityLoading,
    refetch: refetchActivity,
  } = usePubkeyActivity(pubkey as string);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={metadataIsLoading || activityLoading}
          onRefresh={() => {
            refetchMetadata();
            refetchActivity();
          }}
        />
      }
    >
      {profile && <PubkeyProfile pubkey={pubkey} profileData={profile} />}
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
            pathname: `${basePath}/profile/${pubkey}/activity`,
            params: {
              includeBackButton: "true",
            },
          }}
        />
        {!activity.length ? (
          <Center
            style={{
              paddingTop: 20,
            }}
          >
            <Text>This user has no activity</Text>
          </Center>
        ) : (
          <>
            {activity.slice(0, NUM_ACTIVITY_ROWS).map((item) => (
              <ActivityItemRow
                item={item}
                key={item.contentId + item.timestamp}
              />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
};
