import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import MosaicImage from "./Mosaic";
import { Text } from "./shared/Text";
import { BasicAvatar } from "./BasicAvatar";
import { OverflowMenuDialog } from "./FullSizeMusicPlayer/OverflowMenuDialog";
import { useRouter } from "expo-router";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { Track, getAlbumTracks } from "@/utils";
import {
  ActivityItem,
  generateOverflowMenuProps,
  ICON_MAP,
} from "./ActivityItemRow";
import { useNostrProfile } from "@/hooks";
import { satsFormatter } from "./WalletLabel";

export const NostrActivityItemRow = ({
  item,
  isExpanded = true,
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
    contentId,
    parentContentId,
    parentContentTitle,
    type,
    nostrEvent,
  } = item;

  const [overflowDialogIsOpen, setOverflowDialogIsOpen] = useState(false);
  const { loadTrackList } = useMusicPlayer();

  const handlePress = async () => {
    if (contentType === "playlist") {
      router.push({
        pathname: `/pulse/playlist/${contentId}`,
        params: {
          headerTitle: contentTitle,
          includeBackButton: "true",
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
          includeBackButton: "true",
        },
      });
    }
    if (contentType === "artist") {
      router.push({
        pathname: `/pulse/artist/${contentId}`,
        params: {
          headerTitle: contentTitle,
          includeBackButton: "true",
        },
      });
    }
  };

  const {
    data: event,
    isFetching,
    isLoading,
    decodeProfileMetadata,
  } = useNostrProfile(nostrEvent?.pubkey);
  const profile = decodeProfileMetadata(event);
  const metadataIsLoading = isFetching || isLoading;
  const isZap = nostrEvent?.kind === 9734;
  if (!contentId || !contentTitle || !nostrEvent) return null;
  const amountTag = nostrEvent.tags.find(([tag]) => tag === "amount");
  const zapAmount = amountTag ? parseInt(amountTag[1]) : undefined;
  const firstLine = contentTitle;
  const isTrack = item.contentType === "track";
  const secondLine = isTrack ? item.artist : item.parentContentTitle;
  const title = isZap
    ? zapAmount
      ? `@${profile?.name ?? "anon"} sent ${satsFormatter(zapAmount)} sats`
      : `@${profile?.name ?? "anon"} sent a zap`
    : `@${profile?.name ?? "anon"} shared this track`;
  const subtitle = nostrEvent.content || "";
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
          <BasicAvatar
            isLoading={metadataIsLoading}
            uri={profile?.picture}
            pubkey={nostrEvent.pubkey}
          />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text ellipsizeMode="tail" numberOfLines={1} bold>
              {title}
            </Text>
            <Text ellipsizeMode="tail" numberOfLines={1}>
              {subtitle}
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
          contentType={contentType}
          contentId={contentId}
        />
      </TouchableOpacity>
    </View>
  );
};
