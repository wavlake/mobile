import { TouchableOpacity, View, ViewProps } from "react-native";
import { Event } from "nostr-tools";
import { useAuth, useNostrProfileEvent } from "@/hooks";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { useState } from "react";
import { CommentRepliesLink } from "./CommentRepliesLink";
import { ReplyDialog } from "./ReplyDialog";
import { CommentContent } from "./CommentContent";
import { getParentEventId, getITagFromEvent } from "@/utils";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

interface CommentRowProps extends ViewProps {
  commentId: string;
  replies?: Event[];
  showReplyLinks?: boolean;
  isPressable?: boolean;
  showContentDetails?: boolean;
  closeParent?: () => void;
  onPress?: (comment: Event) => void;
}

export const CommentRow = ({
  commentId,
  replies = [],
  showReplyLinks = true,
  isPressable = true,
  showContentDetails = false,
  closeParent,
  onPress,
}: CommentRowProps) => {
  const router = useRouter();
  const basePathname = useGetBasePathname();
  const { data: comment } = useNostrEvent(commentId);
  const contentId = comment ? getITagFromEvent(comment) : undefined;
  const {
    data: npubMetadata,
    isFetching,
    isLoading,
  } = useNostrProfileEvent(comment?.pubkey);
  const metadataIsLoading = isFetching || isLoading;
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!comment) return null;

  const onReplyPress = () => {
    if (onPress) {
      onPress(comment);
    } else {
      const parentEventId = getParentEventId(comment);
      if (parentEventId) {
        router.push(`${basePathname}/comment/${parentEventId}`);
      }
    }
  };

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
      {isPressable ? (
        <TouchableOpacity
          onPress={onReplyPress}
          onLongPress={() => {
            setDialogOpen(true);
          }}
          style={{ flex: 1 }}
        >
          <CommentContent
            associatedContentId={showContentDetails ? contentId : undefined}
            comment={comment}
            npubMetadata={npubMetadata}
            metadataIsLoading={metadataIsLoading}
            closeParent={closeParent}
          />
        </TouchableOpacity>
      ) : (
        <CommentContent
          associatedContentId={showContentDetails ? contentId : undefined}
          comment={comment}
          npubMetadata={npubMetadata}
          metadataIsLoading={metadataIsLoading}
          closeParent={closeParent}
        />
      )}
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
          <CommentRepliesLink replies={replies} parentcommentId={comment.id} />
        </View>
      )}
    </View>
  );
};
