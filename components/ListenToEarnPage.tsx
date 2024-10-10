import { usePromos } from "@/hooks";
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { Center } from "./Center";
import {
  SquareArtwork,
  Text,
  useMiniMusicPlayer,
  useMusicPlayer,
} from "@/components";
import { Track } from "@/utils";
import React from "react";

const ContentItem = ({
  contentMetadata,
  marginBottom,
  onPress,
  canEarnToday,
  earnedToday,
  earnableToday,
}: {
  contentMetadata: Track;
  marginBottom: number;
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
        { marginBottom },
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

export const ListenToEarnPage = () => {
  const { height } = useMiniMusicPlayer();
  const { data: promos = [], isLoading, refetch } = usePromos();
  const { loadTrackList } = useMusicPlayer();
  const handleRowPress = (item: Track) => {
    loadTrackList({
      trackList: [item],
      trackListId: "earning",
      startIndex: 0,
    });
  };

  return (
    <FlatList
      contentContainerStyle={{ flexGrow: 1 }}
      ListHeaderComponent={() => (
        <Center
          style={{
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Top Up
          </Text>
          <Text
            style={{
              fontSize: 14,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            You can earn sats to listen to any of the following promoted tracks.
            Limit of earning once per track per day.
          </Text>
        </Center>
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

        const isLastRow = index === promos.length - 1;
        const marginBottom = isLastRow ? height + 16 : 16;
        const onPress = () => handleRowPress(contentMetadata);
        return (
          <ContentItem
            contentMetadata={contentMetadata}
            marginBottom={marginBottom}
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
