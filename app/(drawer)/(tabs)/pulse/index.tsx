import {
  Center,
  CommentRow,
  PlaylistButton,
  useMiniMusicPlayer,
  useMusicPlayer,
} from "@/components";
import { MoreOptions } from "@/components/FullSizeMusicPlayer/MoreOptions";
import { LikeButton } from "@/components/LikeButton";
import MosaicImage from "@/components/Mosaic";
import { PlayPauseTrackButton } from "@/components/PlayPauseTrackButton";
import { ShareButton } from "@/components/ShareButton";
import { Text } from "@/components/Text";
import {
  useAddAlbumToLibrary,
  useAddArtistToLibrary,
  useAddTrackToLibrary,
  useDeleteAlbumFromLibrary,
  useDeleteArtistFromLibrary,
  useDeleteTrackFromLibrary,
  useIsAlbumInLibrary,
  useIsArtistInLibrary,
  useIsTrackInLibrary,
} from "@/hooks";
import { usePubkeyPlaylists } from "@/hooks/playlist/usePubkeyPlaylists";
import { Playlist, togglePlayPause } from "@/utils";
import { Link, useRouter } from "expo-router";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { State, usePlaybackState } from "react-native-track-player";
interface ActivityItem {
  artwork?: string;
  shareUrl?: string;
  contentTitle?: string;
  contentId: string;
  parentContentTitle?: string;
  parentContentId?: string;
  contentType: string;
  timestamp: string;
  userId: string;
  // zap metadata
  zap?: {
    ampId: number;
    userId: string | "keysend" | "invoice";
    msatAmount: number;
    createdAt: string;
    contentId: string;
    contentType: "track" | "playlist" | "episode";
    comment: string;
  };
}

const mockActivityItems: ActivityItem[] = [
  {
    artwork: "https://picsum.photos/200",
    shareUrl: "https://picsum.photos/200",
    contentTitle: "item #1",
    contentId:
      "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
    contentType: "track",
    timestamp: "2021-08-24T20:00:06Z",
    userId: "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
  },
  {
    artwork: "https://picsum.photos/200",
    shareUrl: "https://picsum.photos/200",
    contentTitle: "A song name",
    contentId: "6ce6d43f-39f0-47fb-b3ef-80c5d0726c09",
    contentType: "album",
    timestamp: "2021-08-24T20:00:05Z",
    userId: "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
    zap: {
      ampId: 1,
      userId:
        "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
      msatAmount: 100000,
      contentId: "6ce6d43f-39f0-47fb-b3ef-80c5d0726c09",
      createdAt: "2021-08-24T20:00:04Z",
      contentType: "track",
      comment: "This is a message from a zap",
    },
  },
  {
    artwork: "https://picsum.photos/200",
    shareUrl: "https://picsum.photos/200",
    contentTitle: "Free Fall",
    contentId: "d1151095-727f-45ee-b46a-0b8b93e4020b",
    contentType: "album",
    timestamp: "2021-08-22T20:00:10Z",
    userId: "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
    zap: {
      ampId: 1,
      userId:
        "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
      msatAmount: 120000,
      createdAt: "2021-08-22T20:00:20Z",
      contentId: "d1151095-727f-45ee-b46a-0b8b93e4020b",
      contentType: "track",
      comment: "dope song",
    },
  },
  {
    artwork: "https://picsum.photos/200",
    shareUrl: "https://picsum.photos/200",
    contentTitle: "Item #4",
    contentId:
      "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
    contentType: "track",
    timestamp: "2021-08-24T20:00:30Z",
    userId: "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
  },
];

const PulsePage = () => {
  const router = useRouter();
  const activity = mockActivityItems;
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
          return (
            <ActivityItemRow
              activityItem={item}
              onPress={() => console.log(item)}
              isLastRow={isLastRow}
            />
          );
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
  onPress,
  isLastRow,
}: {
  activityItem: ActivityItem;
  onPress: () => void;
  isLastRow: boolean;
}) => {
  const {
    contentTitle,
    artwork,
    contentType,
    timestamp,
    userId,
    zap,
    contentId,
    shareUrl,
    parentContentId,
    parentContentTitle,
  } = activityItem;
  const { height } = useMiniMusicPlayer();
  const marginBottom = isLastRow ? height + 16 : 16;
  const isTrackInLibrary = useIsTrackInLibrary(contentId);
  const isArtistInLibrary = useIsArtistInLibrary(contentId);
  const isAlbumInLibrary = useIsAlbumInLibrary(contentId);
  const addTrackToLibraryMutation = useAddTrackToLibrary();
  const addArtistToLibraryMutation = useAddArtistToLibrary();
  const deleteTrackFromLibraryMutation = useDeleteTrackFromLibrary();
  const deleteArtistFromLibraryMutation = useDeleteArtistFromLibrary();
  const addAlbumToLibraryMutation = useAddAlbumToLibrary();
  const deleteAlbumFromLibraryMutation = useDeleteAlbumFromLibrary();

  const { state: playbackState } = usePlaybackState();
  const { loadTrackList, currentTrackListId } = useMusicPlayer();

  const isThisTrackListLoaded = currentTrackListId === parentContentId;
  const isThisTrackListPlaying =
    isThisTrackListLoaded && playbackState !== State.Paused;

  const handlePlayPausePress = () => {
    if (isThisTrackListLoaded) {
      return togglePlayPause();
    }

    if (!parentContentId) {
      return;
    }

    // const topTracks = artist?.topTracks ?? [];

    // if (topTracks.length === 0) {
    //   return;
    // }

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
  const handleLikePress = async () => {
    if (!activityIsMusic) return;

    if (contentType === "track") {
      if (isTrackInLibrary) {
        deleteTrackFromLibraryMutation.mutate(contentId);
      } else {
        addTrackToLibraryMutation.mutate({ id: contentId });
      }
    }

    if (contentType === "artist") {
      if (isArtistInLibrary) {
        deleteArtistFromLibraryMutation.mutate(contentId);
      } else {
        addArtistToLibraryMutation.mutate({ id: contentId });
      }
    }

    if (contentType === "album") {
      if (isAlbumInLibrary) {
        deleteAlbumFromLibraryMutation.mutate(contentId);
      } else {
        addAlbumToLibraryMutation.mutate({ id: contentId });
      }
    }

    // TODO - handle playlists
    // if (contentType === "playlist") {
    // if (isArtistInLibrary) {
    //   deleteArtistFromLibraryMutation.mutate(contentId);
    // } else {
    //   addArtistToLibraryMutation.mutate({ id: contentId });
    // }
    // }
  };

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
      {zap && (
        <CommentRow
          comment={{
            content: zap.comment,
            createdAt: timestamp,
            commenterArtworkUrl: "https://picsum.photos/200",
            msatAmount: zap.msatAmount,
            userId,
            id: zap.ampId,
            name: "Josh",
            title: contentTitle ?? "",
            isNostr: false,
            replies: [],
            contentId: zap.contentId,
          }}
        />
      )}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          marginLeft: 16,
          flexGrow: 1,
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <MosaicImage imageUrls={artwork ? [artwork] : []} size={75} />
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
              {contentTitle}
            </Text>
          </View>
          <PlayPauseTrackButton
            size={50}
            type={isThisTrackListPlaying ? "pause" : "play"}
            onPress={handlePlayPausePress}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 15,
              justifyContent: "flex-start",
            }}
          >
            <LikeButton
              onPress={handleLikePress}
              size={30}
              isLiked={isTrackInLibrary}
              isLoading={
                addTrackToLibraryMutation.isLoading ||
                deleteTrackFromLibraryMutation.isLoading
              }
              isMusic={activityIsMusic}
            />
            <PlaylistButton
              contentId={contentId}
              contentTitle={contentTitle}
              isMusic={activityIsMusic}
            />
            {shareUrl && <ShareButton url={shareUrl} />}
            {activityIsMusic && (
              <MoreOptions
                // TODO - implement this
                artist={"artist"}
                artistId={"artistId"}
                albumTitle={"albumTitle"}
                albumId={"albumId"}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default PulsePage;
