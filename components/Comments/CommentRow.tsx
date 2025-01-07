import { TouchableOpacity, View, ViewProps } from "react-native";
import { Event } from "nostr-tools";
import { useNostrProfileEvent } from "@/hooks";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { useState } from "react";
import { CommentRepliesLink } from "./CommentRepliesLink";
import { ReplyDialog } from "./ReplyDialog";
import { CommentContent } from "./CommentContent";
import { useContentDetails } from "@/hooks/useContentDetails";
import { getITagFromEvent } from "@/utils";

interface CommentRowProps extends ViewProps {
  commentId: string;
  replies?: Event[];
  showReplyLinks?: boolean;
  isPressable?: boolean;
  associatedContentId?: string;
  closeParent?: () => void;
  onPress?: (comment: Event) => void;
}

export const CommentRow = ({
  commentId,
  replies = [],
  showReplyLinks = true,
  isPressable = true,
  closeParent,
  onPress,
}: CommentRowProps) => {
  const { data: comment } = useNostrEvent(commentId);
  const contentId = comment ? getITagFromEvent(comment) : undefined;
  const { data: contentDetails } = useContentDetails(contentId);
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
      setDialogOpen(true);
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
        <TouchableOpacity onPress={onReplyPress} style={{ flex: 1 }}>
          <CommentContent
            associatedContentId={contentDetails?.metadata?.id}
            comment={comment}
            npubMetadata={npubMetadata}
            metadataIsLoading={metadataIsLoading}
            closeParent={closeParent}
          />
        </TouchableOpacity>
      ) : (
        <CommentContent
          associatedContentId={contentDetails?.metadata?.id}
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
