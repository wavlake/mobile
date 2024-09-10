import { TouchableOpacity, View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { SatsEarned } from "../SatsEarned";
import { Text } from "@/components/Text";
import { CommentRepliesLink } from "./CommentRepliesLink";
import { ReplyDialog } from "./ReplyDialog";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Event, nip19, UnsignedEvent } from "nostr-tools";
import { useNostrProfileEvent } from "@/hooks";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { NostrUserProfile } from "@/utils";
import { msatsToSatsWithCommas } from "../WalletLabel";

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

  return npubMetadata?.name ? `${npubMetadata.name} shared this` : "";
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
  const [amountTag, zapAmount] =
    comment.tags.find(([tag, amount]) => tag === "amount") || [];
  const npub = nip19.npubEncode(pubkey);

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
        marginBottom: 16,
        flexDirection: "row",
        paddingHorizontal: 16,
      }}
    >
      <ReplyDialog
        setIsOpen={setDialogOpen}
        commentId={commentId}
        isOpen={dialogOpen}
        setCachedReplies={setCachedReplies}
      />
      <BasicAvatar uri={picture} pubkey={pubkey} npubMetadata={npubMetadata} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text bold>{name}</Text>
        <Text>{commentText}</Text>
        {/* {msatAmount && (
          <SatsEarned
            msats={msatAmount}
            extraText={extraText}
            defaultTextColor
          />
        )} */}
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
            <TouchableOpacity onPress={onReplyPress} style={{}}>
              <MaterialCommunityIcons
                name="comment-plus-outline"
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
