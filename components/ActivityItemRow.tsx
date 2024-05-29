import { useState } from "react";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";
import { State, usePlaybackState } from "react-native-track-player";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { togglePlayPause } from "@/utils";
import { CommentRow } from "./CommentRow";
import { Pressable, View } from "react-native";
import MosaicImage from "./Mosaic";
import { Text } from "@/components/Text";

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

export const ActivityItemRow = ({
  item,
  isLastRow,
  isExpanded = false,
}: {
  item: ActivityItem;
  isLastRow: boolean;
  isExpanded?: boolean;
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
    description,
  } = item;
  console.log("ActivityItemRow", item.contentArtwork);
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
      {isExpanded && zapAmount && (
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
          flexGrow: 1,
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <MosaicImage imageUrls={contentArtwork} size={isExpanded ? 75 : 30} />
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
              {isExpanded ? contentTitle : description}
            </Text>
            <Text style={{ fontSize: 18 }} numberOfLines={3} bold>
              {isExpanded ? parentContentTitle : message}
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
