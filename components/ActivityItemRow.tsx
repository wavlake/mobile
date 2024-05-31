import { useState } from "react";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { getPlaylist, togglePlayPause } from "@/utils";
import { TouchableOpacity, View } from "react-native";
import MosaicImage from "./Mosaic";
import { Text } from "@/components/Text";
import { BasicAvatar } from "./BasicAvatar";
import { OverflowMenuDialog } from "./FullSizeMusicPlayer/OverflowMenuDialog";
import { useQuery } from "@tanstack/react-query";

export interface ActivityItem {
  picture: string;
  name: string;
  userId: string;
  pubkey: string;
  description: string;
  type: ActivityType;
  message?: string;
  zapAmount?: number;
  timestamp: string;
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
  contentArtwork: string[];
  parentContentId: string;
  parentContentTitle: string;
  parentContentType: string;
}
type ContentType =
  | "track"
  | "episode"
  | "podcast"
  | "album"
  | "artist"
  | "playlist";

type ActivityType = "playlistCreate" | "zap" | "playlistUpdate";

const generateTitle = (item: ActivityItem) => {
  const actionMap: Record<ActivityType, string> = {
    playlistUpdate: `@${item.name} updated a playlist`,
    zap: `@${item.name} sent ${item.zapAmount} sats`,
    playlistCreate: `@${item.name} created a playlist`,
  };

  return actionMap[item.type];
};
const generateDesc = (item: ActivityItem) => {
  const actionMap: Record<ActivityType, string> = {
    playlistUpdate: `"${item.contentTitle}"`,
    zap: `"${item.message}"`,
    playlistCreate: `"${item.contentTitle}"`,
  };

  return actionMap?.[item.type];
};

const generateOverflowMenuProps = (item: ActivityItem) => {
  const actionMap: Record<
    ContentType,
    {
      artist?: string;
      artistId?: string;
      albumTitle?: string;
      albumId?: string;
      playlistTitle?: string;
      playlistId?: string;
    }
  > = {
    playlist: {
      playlistTitle: item.contentTitle,
      playlistId: item.contentId,
    },
    artist: {
      artist: item.contentTitle,
      artistId: item.contentId,
    },
    album: {
      albumTitle: item.contentTitle,
      albumId: item.contentId,
      artist: item.parentContentTitle,
      artistId: item.parentContentId,
    },
    track: {
      albumTitle: item.parentContentTitle,
      albumId: item.parentContentId,
    },
    // TODO - update overflow menu to support podcasts
    episode: {},
    podcast: {},
  };

  return actionMap?.[item.contentType];
};

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
  const [overflowDialogIsOpen, setOverflowDialogIsOpen] = useState(false);
  const { height } = useMiniMusicPlayer();
  const marginBottom = isLastRow ? height + 16 : 16;
  const { loadTrackList, currentTrackListId } = useMusicPlayer();

  const {
    refetch,
    isFetching,
    data: cachedTrackListData,
  } = useQuery({
    queryKey: [contentType, contentId],
    queryFn: async () => {
      // TODO - add more content types here
      if (contentType === "playlist") {
        const playlist = await getPlaylist(contentId);
        return {
          trackList: playlist.tracks,
          trackListId: contentId,
          startIndex: 0,
          playerTitle: contentTitle,
        };
      }
    },
    enabled: false,
  });
  const handlePlayPausePress = () => {
    if (contentType === "playlist" && currentTrackListId === contentId) {
      return togglePlayPause();
    }
    console.log({ contentId, contentTitle, contentType });

    if (cachedTrackListData) {
      return loadTrackList(cachedTrackListData);
    }

    refetch().then(({ data: trackListData }) => {
      trackListData && loadTrackList(trackListData);
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
        gap: 10,
      }}
    >
      {isExpanded && (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            height: 40,
          }}
        >
          <BasicAvatar uri={picture} pubkey={userId} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text ellipsizeMode="tail" numberOfLines={1} bold>
              {generateTitle(item)}
            </Text>
            <Text ellipsizeMode="tail" numberOfLines={1}>
              {generateDesc(item)}
            </Text>
          </View>
        </View>
      )}
      <TouchableOpacity
        onPress={handlePlayPausePress}
        onLongPress={() => setOverflowDialogIsOpen(true)}
        style={{
          display: "flex",
          flexDirection: "row",
          flexGrow: 1,
          gap: 10,
          justifyContent: "space-between",
          opacity: isFetching ? 0.5 : 1,
        }}
      >
        <MosaicImage imageUrls={contentArtwork} size={isExpanded ? 75 : 30} />
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            flex: 1,
          }}
        >
          <Text numberOfLines={1} bold>
            {isExpanded ? contentTitle : generateTitle(item)}
          </Text>
          <Text numberOfLines={1}>
            {isExpanded ? parentContentTitle : generateDesc(item)}
          </Text>
        </View>
        {activityIsMusic && (
          <OverflowMenuDialog
            {...generateOverflowMenuProps(item)}
            setIsOpen={setOverflowDialogIsOpen}
            isOpen={overflowDialogIsOpen}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};
