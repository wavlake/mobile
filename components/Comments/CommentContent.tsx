import { View, ViewProps } from "react-native";
import { Text } from "../shared/Text";
import { Event } from "nostr-tools";
import { msatsToSatsWithCommas } from "../WalletLabel";
import { ParsedTextRender } from "./ParsedTextRenderer";
import { PulsatingEllipsisLoader } from "../PulsatingEllipsisLoader";
import { BasicAvatar } from "../BasicAvatar";
import { NostrUserProfile } from "@/utils";

interface CommentContentProps extends ViewProps {
  comment: Event;
  npubMetadata?: NostrUserProfile | null;
  metadataIsLoading: boolean;
  closeParent?: () => void;
}

export const getCommentText = (
  event: Event,
  npubMetadata?: NostrUserProfile | null,
): string => {
  if (event.content) {
    return event.content;
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
  closeParent,
}: CommentContentProps) => {
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
    <View style={{ flexDirection: "row" }}>
      <BasicAvatar
        uri={picture}
        pubkey={pubkey}
        npubMetadata={npubMetadata}
        isLoading={metadataIsLoading}
        closeParent={closeParent}
      />
      <View style={{ marginLeft: 10, flex: 1 }}>
        {metadataIsLoading ? (
          <PulsatingEllipsisLoader />
        ) : (
          <Text bold>{name ?? "anonymous"}</Text>
        )}
        <ParsedTextRender content={commentText} />
      </View>
    </View>
  );
};
