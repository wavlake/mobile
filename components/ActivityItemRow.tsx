import { ReactElement, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import MosaicImage from "./Mosaic";
import { Text } from "@/components/Text";
import { BasicAvatar } from "./BasicAvatar";
import { OverflowMenuDialog } from "./FullSizeMusicPlayer/OverflowMenuDialog";
import { useRouter } from "expo-router";
import { satsFormatter } from "./WalletBalance";
import { Octicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Foundation } from "@expo/vector-icons";
import { ZapIcon } from "./ZapIcon";
import { brandColors } from "@/constants";
import { LightningIcon } from "./LightningIcon";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { Track, getAlbumTracks } from "@/utils";

export interface ActivityItem {
  picture: string;
  name: string;
  userId: string;
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

type ActivityType =
  | "playlistCreate"
  | "zap"
  | "playlistUpdate"
  | "trackPublish"
  | "trending"
  | "hot";

const ICON_MAP: Record<ActivityType, ReactElement> = {
  playlistCreate: (
    <MaterialCommunityIcons
      name="playlist-music"
      size={24}
      color={brandColors.purple.DEFAULT}
    />
  ),
  playlistUpdate: (
    <MaterialCommunityIcons
      name="playlist-music"
      size={24}
      color={brandColors.purple.DEFAULT}
    />
  ),
  // zap: <ZapIcon fill={brandColors.pink.DEFAULT} width={24} height={24} />,
  zap: (
    <LightningIcon width={24} height={24} fill={brandColors.orange.DEFAULT} />
  ),
  trackPublish: (
    <Foundation name="music" size={24} color={brandColors.pink.DEFAULT} />
  ),
  trending: (
    <MaterialCommunityIcons
      name="trending-up"
      size={24}
      color={brandColors.mint.DEFAULT}
    />
  ),
  hot: (
    <FontAwesome6 name="fire" size={24} color={brandColors.orange.DEFAULT} />
  ),
  // live: <Feather name="radio" size={24} color="black" />,
};

const generateTitle = (item: ActivityItem) => {
  const actionMap: Record<ActivityType, string> = {
    playlistUpdate: `@${item.name} updated a playlist`,
    zap: `@${item.name ?? "anon"} sent ${satsFormatter(
      item?.zapAmount ?? 0,
    )} sats`,
    playlistCreate: `@${item.name} created a playlist`,
    trackPublish: `@${item.name} published a track`,
    trending: `${item.contentTitle} is trending`,
    hot: `${item.contentTitle} is hot`,
  };

  return actionMap?.[item.type];
};
const generateSubTitle = (item: ActivityItem) => {
  const actionMap: Record<ActivityType, string> = {
    playlistUpdate: item.parentContentTitle,
    zap: item.message ? `"${item.message}"` : "",
    playlistCreate: item.parentContentTitle,
    trackPublish: item.contentTitle,
    trending: "",
    hot: "",
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
      trackTitle?: string;
      trackId?: string;
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
      trackTitle: item.contentTitle,
      trackId: item.contentId,
    },
    // TODO - update overflow menu to support podcasts
    episode: {},
    podcast: {},
  };

  return actionMap?.[item.contentType];
};

export const ActivityItemRow = ({
  item,
  isExpanded = false,
}: {
  item: ActivityItem;
  isExpanded?: boolean;
}) => {
  const router = useRouter();
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
    type,
  } = item;

  const [overflowDialogIsOpen, setOverflowDialogIsOpen] = useState(false);
  const { loadTrackList } = useMusicPlayer();

  const handlePress = async () => {
    if (contentType === "playlist") {
      router.push({
        pathname: `/pulse/playlist/${contentId}`,
        params: {
          headerTitle: contentTitle,
          includeBackButton: true,
        },
      });
    }

    if (contentType === "track") {
      const tracks = await getAlbumTracks(parentContentId);
      const targetTrack = tracks.find((t) => t.id === contentId);
      const track: Track = {
        id: contentId,
        liveUrl: targetTrack?.liveUrl ?? "",
        duration: targetTrack?.duration ?? 0,
        title: contentTitle,
        artist: targetTrack?.artist ?? "",
        albumId: parentContentId,
        albumTitle: parentContentTitle,
        artworkUrl: targetTrack?.artworkUrl ?? "",
        artistId: targetTrack?.artistId ?? "",
        avatarUrl: targetTrack?.avatarUrl ?? "",
      };

      loadTrackList({
        trackList: [track],
        trackListId: contentId,
        startIndex: 0,
        playerTitle: contentTitle,
      });
    }
    if (contentType === "album") {
      router.push({
        pathname: `/pulse/album/${contentId}`,
        params: {
          headerTitle: contentTitle,
          includeBackButton: true,
        },
      });
    }
    if (contentType === "artist") {
      router.push({
        pathname: `/pulse/artist/${contentId}`,
        params: {
          headerTitle: contentTitle,
          includeBackButton: true,
        },
      });
    }
  };

  if (!contentId || !contentTitle) return null;
  const firstLine = isExpanded ? contentTitle : generateTitle(item);
  const secondLine = isExpanded ? parentContentTitle : generateSubTitle(item);
  const icon = ICON_MAP[type];

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: 16,
        alignItems: "center",
        gap: 10,
      }}
    >
      {isExpanded && (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            marginTop: 20,
            height: 40,
          }}
        >
          <BasicAvatar uri={picture} pubkey={userId} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text ellipsizeMode="tail" numberOfLines={1} bold>
              {generateTitle(item)}
            </Text>
            <Text ellipsizeMode="tail" numberOfLines={1}>
              {contentType === "playlist" ? "" : generateSubTitle(item)}
            </Text>
          </View>
        </View>
      )}
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={() => {
          setOverflowDialogIsOpen(true);
        }}
        style={{
          display: "flex",
          flexDirection: "row",
          flexGrow: 1,
          gap: 10,
        }}
      >
        <MosaicImage imageUrls={contentArtwork} size={60} />
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          {firstLine && (
            <Text numberOfLines={1} bold>
              {firstLine}
            </Text>
          )}
          {secondLine && <Text numberOfLines={1}>{secondLine}</Text>}
        </View>
        {icon}
        <OverflowMenuDialog
          {...generateOverflowMenuProps(item)}
          setIsOpen={setOverflowDialogIsOpen}
          isOpen={overflowDialogIsOpen}
        />
      </TouchableOpacity>
    </View>
  );
};
