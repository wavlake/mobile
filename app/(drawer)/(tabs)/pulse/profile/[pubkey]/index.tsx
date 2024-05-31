import { Dimensions, FlatList, RefreshControl, View } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { useLocalSearchParams } from "expo-router";
import { usePubkeyActivity } from "@/hooks/usePubkeyActivity";
import {
  PubkeyPlaylists,
  PubkeyProfile,
  Center,
  Text,
  ActivityItemRow,
} from "@/components/";
import { useEffect, useState } from "react";
import { useCatalogPubkey } from "@/hooks/nostrProfile/useCatalogPubkey";

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

const PubkeyProfilePage = ({ pubkey }: { pubkey: string }) => {
  const [upperSectionHeight, setUpperSectionHeight] = useState(100);
  const [activityRowHeight, setActivityRowHeight] = useState(0);
  const [numberOfRows, setNumberOfRows] = useState(0);
  const {
    data: profileData,
    refetch: refetchPubkeyData,
    isLoading: isLoadingPubkeyData,
  } = useCatalogPubkey(pubkey as string);
  const banner = profileData?.metadata?.banner;
  const {
    data: activity = [],
    isLoading,
    refetch,
  } = usePubkeyActivity(pubkey as string);

  const screenHeight = Dimensions.get("window").height;
  useEffect(() => {
    const buffer = banner ? 80 : 110;
    // calculate the number of rows that can fit on the screen
    const activityRowCount = Math.floor(
      (screenHeight - upperSectionHeight - buffer) / activityRowHeight,
    );
    setNumberOfRows(activityRowCount);
  }, [screenHeight, upperSectionHeight, banner, activityRowHeight]);

  return (
    <FlatList
      data={activity.slice(0, numberOfRows)}
      refreshControl={
        <RefreshControl
          refreshing={isLoading || isLoadingPubkeyData}
          onRefresh={() => {
            refetch();
            refetchPubkeyData();
          }}
        />
      }
      ListHeaderComponent={() => (
        <View
          onLayout={(event) => {
            setUpperSectionHeight(event.nativeEvent.layout.height);
          }}
        >
          {profileData && <PubkeyProfile profileData={profileData} />}
          <View
            style={{
              padding: 16,
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
          </View>
        </View>
      )}
      renderItem={({ item, index }) => (
        <View
          onLayout={(event) =>
            setActivityRowHeight(event.nativeEvent.layout.height)
          }
          style={{
            paddingHorizontal: 16,
          }}
        >
          <ActivityItemRow
            item={item}
            isLastRow={index === activity.length - 1}
          />
        </View>
      )}
      keyExtractor={(item) => item.contentId + item.timestamp}
    />
  );
};
