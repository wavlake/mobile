import {
  Center,
  CommentRow,
  useMiniMusicPlayer,
  useMusicPlayer,
} from "@/components";
import MosaicImage from "@/components/Mosaic";
import { Text } from "@/components/Text";
import { togglePlayPause } from "@/utils";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { State, usePlaybackState } from "react-native-track-player";

export interface ActivityItem {
  picture: string;
  name: string;
  userId: string;
  pubkey: string;
  description: string;
  type: string;
  message?: string;
  zapAmount?: number;
  timestamp: string;
  contentId: string;
  contentTitle: string;
  contentType: string;
  contentArtwork: string[];
  parentContentId: string;
  parentContentTitle: string;
  parentContentType: string;
}

export const mockActivityItems: ActivityItem[] = [
  {
    picture: "https://picsum.photos/200",
    contentId: "d6ea5835-e584-46eb-8e2b-ff17d1a822e5",
    contentTitle: "item #1",
    contentType: "track",
    contentArtwork: ["https://picsum.photos/200"],
    timestamp: "2021-08-24T20:20:06Z",
    userId: "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
    pubkey: "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
    name: "Josh",
    description: "@Josh zapped this track",
    type: "zap",
    zapAmount: 10000,
    parentContentId: "727c7538-1a3c-4120-a81e-8e63f5dbe027",
    parentContentTitle: "playlist title",
    parentContentType: "playlist",
  },
  {
    picture: "https://picsum.photos/200",
    contentId: "0010ec00-2ac4-4b25-88ff-70d604413dc3",
    contentTitle: "item #1",
    contentType: "track",
    contentArtwork: ["https://picsum.photos/200"],
    timestamp: "2021-08-24T20:00:16Z",
    userId: "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
    pubkey: "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
    name: "Josh",
    description: "@Josh commented on this track",
    type: "zap",
    message: "great track!!",
    zapAmount: 312000,
    parentContentId: "db63f4ca-4017-4843-b4b0-aefee929238e",
    parentContentTitle: "album title here",
    parentContentType: "album",
  },
];

const PulsePage = () => {
  const router = useRouter();
  const activity = mockActivityItems;
  // TODO - add activty endpoint
  // const {
  //   data: activity = [],
  //   isLoading,
  //   refetch,
  // } = usePubkeyPlaylists(
  //   "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
  // );

  return (
    <View style={{ height: "100%", paddingTop: 16, paddingHorizontal: 0 }}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        data={activity}
        // refreshControl={
        //   <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        // }
        renderItem={({ item, index }) => {
          const isLastRow = index === activity.length - 1;
          return <ActivityItemRow activityItem={item} isLastRow={isLastRow} />;
        }}
        keyExtractor={(item) => item.contentId + item.timestamp}
        scrollEnabled
        ListEmptyComponent={
          <Center>
            <Text>No follower activity yet.</Text>
          </Center>
        }
      />
    </View>
  );
};

const ActivityItemRow = ({
  activityItem,
  isLastRow,
}: {
  activityItem: ActivityItem;
  isLastRow: boolean;
}) => {
  const {
    contentTitle,
    contentArtwork,
    contentType,
    timestamp,
    userId,
    contentId,
    parentContentId,
    parentContentTitle,
    message,
    picture,
    zapAmount,
    name,
  } = activityItem;
  const [overflowDialogIsOpen, setOverflowDialogIsOpen] = useState(false);
  const { height } = useMiniMusicPlayer();
  const marginBottom = isLastRow ? height + 16 : 16;
  const { state: playbackState } = usePlaybackState();
  const { loadTrackList, currentTrackListId } = useMusicPlayer();

  const isThisTrackListLoaded = currentTrackListId === parentContentId;
  const isThisTrackListPlaying =
    isThisTrackListLoaded && playbackState !== State.Paused;

  const handlePlayPausePress = () => {
    if (isThisTrackListLoaded) {
      return togglePlayPause();
    }

    // TODO - get content list from activity item
    // e.g. an albums tracks, playlist tracks, etc.
    return loadTrackList({
      trackList: [],
      trackListId: parentContentId,
      // use index of selected item in the list
      startIndex: 0,
      playerTitle: parentContentTitle,
    });
  };

  const activityIsMusic =
    contentType === "track" ||
    // contentType === "playlist" ||
    contentType === "album" ||
    contentType === "artist";

  if (!contentId || !contentTitle) return null;

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom,
        alignItems: "center",
      }}
    >
      {zapAmount && (
        <CommentRow
          comment={{
            content: message,
            createdAt: timestamp,
            commenterArtworkUrl: picture,
            msatAmount: zapAmount,
            userId,
            name: name,
            title: contentTitle,
            isNostr: true,
            replies: [],
            contentId,
          }}
        />
      )}
      <Pressable
        onPress={handlePlayPausePress}
        onLongPress={() => setOverflowDialogIsOpen(true)}
        style={{
          display: "flex",
          flexDirection: "row",
          marginLeft: 16,
          flexGrow: 1,
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <MosaicImage imageUrls={contentArtwork} size={75} />
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text style={{ fontSize: 18 }} numberOfLines={3} bold>
              {contentTitle}
            </Text>
            <Text style={{ fontSize: 18 }} numberOfLines={3} bold>
              {parentContentTitle}
            </Text>
          </View>
          {/* {activityIsMusic && (
            <OverflowMenuDialog
              // TODO - implement this
              artist={"artist"}
              artistId={"artistId"}
              albumTitle={"albumTitle"}
              albumId={"albumId"}
              setIsOpen={setOverflowDialogIsOpen}
              isOpen={overflowDialogIsOpen}
            />
          )} */}
        </View>
      </Pressable>
    </View>
  );
};

export default PulsePage;
