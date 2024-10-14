import { usePromos } from "@/hooks";
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { Center } from "./Center";
import { SquareArtwork, Text, useMusicPlayer } from "@/components";
import { Track } from "@/utils";
import React from "react";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

const ContentItem = ({
  contentMetadata,
  onPress,
  canEarnToday,
  earnedToday,
  earnableToday,
}: {
  contentMetadata: Track;
  onPress: () => void;
  canEarnToday: boolean;
  earnedToday: number;
  earnableToday: number;
}) => {
  const userEarningsTotal = `${earnedToday / 1000}/${
    earnableToday / 1000
  } sats`;
  const noRewardsLeft = !canEarnToday;
  return (
    <TouchableOpacity
      style={[
        styles.container,
        noRewardsLeft && styles.noRewardsLeftContainter,
      ]}
      onPress={onPress}
    >
      <View style={styles.contentWrapper}>
        <SquareArtwork size={150} url={contentMetadata.artworkUrl} />
        <View
          style={{
            flexDirection: "column",
            display: "flex",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              justifyContent: "center",
              paddingTop: 20,
              flexGrow: 1,
            }}
          >
            <Text style={[styles.title]} numberOfLines={2}>
              {contentMetadata.title}
            </Text>
            <Text style={[styles.artist]}>{contentMetadata.artist}</Text>
          </View>
          <View style={styles.earningsContainer}>
            <Text style={[styles.earnings]}>{userEarningsTotal}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  noRewardsLeftContainter: {
    opacity: 0.5,
  },
  contentWrapper: {
    flexDirection: "row",
    gap: 10,
  },
  textContainer: {
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  artist: {
    fontSize: 14,
  },
  spentArtwork: {
    opacity: 0.7,
  },
  earningsContainer: {
    justifyContent: "center",
  },
  earnings: {
    fontSize: 14,
  },
});

export const TopUpPage = () => {
  const router = useRouter();
  const basePathname = useGetBasePathname();
  const { data: promos = [], isLoading, refetch } = usePromos();
  const { loadTrackList } = useMusicPlayer();
  const handleRowPress = (item: Track) => {
    loadTrackList({
      trackList: [item],
      trackListId: "earning",
      startIndex: 0,
    });
    router.push({
      pathname: "/player",
      params: { basePathname },
    });
  };

  return (
    <FlatList
      contentContainerStyle={{ flexGrow: 1 }}
      ListHeaderComponent={() => (
        <Text
          style={{
            fontSize: 14,
            // marginBottom: 16,
            padding: 16,
            textAlign: "center",
          }}
        >
          You can earn sats to listen to any of the following promoted tracks.
          Limit of earning once per track per day.
        </Text>
      )}
      data={promos}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      renderItem={({ item, index }) => {
        if (!item) return null;

        const {
          contentMetadata,
          promoUser: { canEarnToday, earnedToday, earnableToday },
        } = item;

        const onPress = () => handleRowPress(contentMetadata);
        return (
          <ContentItem
            contentMetadata={contentMetadata}
            onPress={onPress}
            canEarnToday={canEarnToday}
            earnedToday={earnedToday}
            earnableToday={earnableToday}
          />
        );
      }}
      keyExtractor={(item) => (item ? item.contentId : "null")}
      scrollEnabled
      ListEmptyComponent={
        <Center>
          <Text>
            There are currently no active promos available to you, please check
            back tomorrow.
          </Text>
        </Center>
      }
    />
  );
};
