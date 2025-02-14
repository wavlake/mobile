import { ActivityIndicator, View, ViewProps } from "react-native";
import { Text } from "../shared/Text";
import { Event } from "nostr-tools";
import { msatsToSatsWithCommas, satsFormatter } from "../WalletLabel";
import { ParsedTextRender } from "./ParsedTextRenderer";
import { PulsatingEllipsisLoader } from "../PulsatingEllipsisLoader";
import { BasicAvatar } from "../BasicAvatar";
import { NostrUserProfile, parseZapRequestFromReceipt } from "@/utils";
import MosaicImage from "../Mosaic";
import { useContentDetails } from "@/hooks/useContentDetails";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { useNostrProfile } from "@/hooks";

interface CommentContentProps extends ViewProps {
  comment: Event;
  isReaction?: boolean;
  npubMetadata?: NostrUserProfile | null;
  metadataIsLoading?: boolean;
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
  isReaction = false,
  npubMetadata,
  metadataIsLoading = false,
  associatedContentId,
  closeParent,
}: CommentContentProps) => {
  const { data: contentDetails } = useContentDetails(associatedContentId);
  const artworkUrl = contentDetails?.metadata?.artwork_url;
  const title = contentDetails?.metadata?.title;
  const artist = contentDetails?.metadata?.artist;
  const { picture, name } = npubMetadata || {};
  const { content, pubkey, kind } = comment;
  const isZap = comment.kind === 9735;
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
            <View
              style={{
                width: "100%",
                flexDirection: "row",
              }}
            >
              {title && <Text bold>{title}</Text>}
              {artist && title && <Text> - </Text>}
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
            <View style={{ flexDirection: "row", gap: 4 }}>
              {comment.kind === 7 && <ReactionInfo comment={comment} />}
              {comment.kind === 9735 && <ZapInfo comment={comment} />}
              {/* TODO - refactor/remove this backwards compatibility with 9734 events rendered in the app */}
              {(comment.kind === 1 || comment.kind === 9734) && (
                <ParsedTextRender content={commentText} />
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const ReactionInfo = ({ comment }: { comment: Event }) => {
  const { content } = comment;

  const [eTag, eventId] = comment.tags.find(([tag]) => tag === "e") ?? [];

  const { data: eventReactedTo, isLoading } = useNostrEvent(eventId);
  const {
    data: authorProfileEvent,
    isPending,
    decodeProfileMetadata,
  } = useNostrProfile(eventReactedTo?.pubkey);
  const authorProfile = decodeProfileMetadata(authorProfileEvent);

  if (!content) {
    return <Text>Reacted</Text>;
  }

  return (
    <View
      style={{
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Text>{content.length > 0 ? `Reacted with ${content}` : "Reacted"}</Text>
      <View
        style={{
          width: "100%",
          overflow: "hidden",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: 8,
          borderRadius: 8,
          marginVertical: 8,
        }}
      >
        {isLoading ? (
          <ActivityIndicator />
        ) : eventReactedTo ? (
          <CommentContent
            npubMetadata={authorProfile}
            metadataIsLoading={isPending}
            comment={eventReactedTo}
          />
        ) : (
          <Text>Event not found</Text>
        )}
      </View>
    </View>
  );
};

const ZapInfo = ({ comment }: { comment: Event }) => {
  const { receipt, amount } = parseZapRequestFromReceipt(comment);
  if (!receipt || !amount) {
    return <Text>Zapped you</Text>;
  }
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          gap: 4,
          alignItems: "center",
        }}
      >
        <Text>Zapped </Text>
        <Text bold>{satsFormatter(amount * 1000)} sats</Text>
      </View>
      {receipt.content && <Text>{receipt.content}</Text>}
    </View>
  );
};
