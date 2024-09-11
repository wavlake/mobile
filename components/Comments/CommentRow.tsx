import { TouchableOpacity, View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "@/components/Text";
import { CommentRepliesLink } from "./CommentRepliesLink";
import { ReplyDialog } from "./ReplyDialog";
import { useState } from "react";
import { Event, UnsignedEvent } from "nostr-tools";
import { useNostrProfileEvent } from "@/hooks";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { NostrUserProfile } from "@/utils";
import { msatsToSatsWithCommas } from "../WalletLabel";
import { ParsedTextRender } from "./ParsedTextRenderer";

interface CommentRowProps extends ViewProps {
  commentId: string;
  replies?: Event[];
  showReplyLinks?: boolean;
}

const getCommentText = (
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

export const CommentRow = ({
  commentId,
  replies = [],
  showReplyLinks = true,
}: CommentRowProps) => {
  const { data: comment } = useNostrEvent(commentId);
  const { data: npubMetadata } = useNostrProfileEvent(comment?.pubkey);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cachedReplies, setCachedReplies] = useState<UnsignedEvent[]>([]);
  const onReplyPress = () => {
    setDialogOpen(true);
  };

  if (!comment) return null;

  const { picture, name } = npubMetadata || {};
  const { id, content, pubkey, kind } = comment;

  const isZap = kind === 9734;
  // don't render empty comments that arent zaps
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
        marginBottom: 10,
        flexDirection: "row",
        paddingHorizontal: 16,
      }}
    >
      <ReplyDialog
        setIsOpen={setDialogOpen}
        commentId={commentId}
        isOpen={dialogOpen}
      />
      <BasicAvatar uri={picture} pubkey={pubkey} npubMetadata={npubMetadata} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <TouchableOpacity onPress={onReplyPress} style={{}}>
          <Text bold>{name ?? "anonymous"}</Text>
          <ParsedTextRender content={commentText} />
          {/* {msatAmount && (
          <SatsEarned
            msats={msatAmount}
            extraText={extraText}
            defaultTextColor
          />
        )} */}
        </TouchableOpacity>

        {showReplyLinks && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: 20,
              paddingBottom: 10,
              gap: 8,
            }}
          >
            <CommentRepliesLink
              replies={[...replies, ...cachedReplies]}
              parentcommentId={id}
            />
          </View>
        )}
      </View>
    </View>
  );
};
