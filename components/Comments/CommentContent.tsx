import { View, ViewProps } from "react-native";
import { Text } from "../shared/Text";
import { Event } from "nostr-tools";
import { msatsToSatsWithCommas } from "../WalletLabel";
import { ParsedTextRender } from "./ParsedTextRenderer";
import { PulsatingEllipsisLoader } from "../PulsatingEllipsisLoader";
import { BasicAvatar } from "../BasicAvatar";
import { NostrUserProfile } from "@/utils";
import MosaicImage from "../Mosaic";
import { useContentDetails } from "@/hooks/useContentDetails";

interface CommentContentProps extends ViewProps {
  comment: Event;
  npubMetadata?: NostrUserProfile | null;
  metadataIsLoading: boolean;
  associatedContentId?: string | null;
  closeParent?: () => void;
}

export const getCommentText = (
  event: Event,
  npubMetadata?: NostrUserProfile | null,
): string => {
  if (event.content) {
    // Example content with newlines
    // Sam coming with the Xmas spirit! \n\nhttps://wavlake.com/track/8420d8e4-9d23-47e2-a5d4-85ab967aec3a\n\nnostr:nevent1qvzqqqpxquqzqqxud4f3c57wmrq2x309cvuq2f5khgl3v5dygk0ppsrtccsrsjxeeuszv8
    // these content links, nostr:nevent links, and new lines are being added in hooks/useZapContent.ts, and also by Fountain nostr comments
    // they arent necessary when displaying the comment in the app, so we remove the new lines here
    // the links are removed in ParsedTextRenderer.tsx
    let formattedContent;
    // Remove preceding newlines before a Wavlake link followed by a Nostr link
    formattedContent = event.content.replace(
      /\n\n(?=https:\/\/wavlake\.com\/track\/[a-f0-9\-]{36}\n\nnostr:nevent1[a-zA-Z0-9]+)/g,
      "",
    );

    // Remove newlines between Wavlake link and Nostr link
    formattedContent = formattedContent.replace(
      /https:\/\/wavlake\.com\/track\/[a-f0-9\-]{36}\n\nnostr:nevent1[a-zA-Z0-9]+/g,
      (match) => match.replace(/\n\n/, " "),
    );

    return formattedContent;
  }

  if (event.kind === 9734) {
    const amountTag = event.tags.find(([tag]) => tag === "amount");
    if (amountTag) {
      const msatsInt = parseInt(amountTag[1]);
      return isNaN(msatsInt)
        ? ""
        : `Zapped ${msatsToSatsWithCommas(msatsInt)} sats`;
    } else {
      return "";
    }
  }

  return npubMetadata?.name
    ? `${npubMetadata.name} shared this artist's content`
    : "";
};

export const CommentContent = ({
  comment,
  npubMetadata,
  metadataIsLoading,
  associatedContentId,
  closeParent,
}: CommentContentProps) => {
  const { data: contentDetails } = useContentDetails(associatedContentId);
  const artworkUrl = contentDetails?.metadata?.artwork_url;
  const title = contentDetails?.metadata?.title;
  const album = contentDetails?.metadata?.album_title;
  const artist = contentDetails?.metadata?.artist;
  const { picture, name } = npubMetadata || {};
  const { content, pubkey, kind } = comment;

  const isZap = kind === 9734;
  if (content.length === 0 && !isZap) {
    return null;
  }
  const commentText = getCommentText(comment, npubMetadata);

  if (!commentText) {
    return null;
  }

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {associatedContentId && (
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            gap: 10,
          }}
        >
          <MosaicImage imageUrls={[artworkUrl]} />
          <View>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Text>Comment by</Text>
              {metadataIsLoading ? (
                <PulsatingEllipsisLoader />
              ) : (
                <Text bold>{name ?? "anonymous"}</Text>
              )}
            </View>
            {title && <Text bold>{title}</Text>}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
              }}
            >
              {album && <Text bold>{album}</Text>}
              {artist && album && <Text> - </Text>}
              {artist && <Text>{artist}</Text>}
            </View>
          </View>
        </View>
      )}
      <View
        style={{
          width: "100%",
          flexDirection: "row",
        }}
      >
        {!associatedContentId && (
          <BasicAvatar
            uri={picture}
            pubkey={pubkey}
            npubMetadata={npubMetadata}
            isLoading={metadataIsLoading}
            closeParent={closeParent}
          />
        )}
        {associatedContentId ? (
          <View style={{ marginLeft: 10, flex: 1 }}>
            <ParsedTextRender content={commentText} />
          </View>
        ) : (
          <View style={{ marginLeft: 10, flex: 1 }}>
            {metadataIsLoading ? (
              <PulsatingEllipsisLoader />
            ) : (
              <Text bold>{name ?? "anonymous"}</Text>
            )}
            <ParsedTextRender content={commentText} />
          </View>
        )}
      </View>
    </View>
  );
};
