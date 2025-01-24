import { TouchableOpacity, View, ViewProps } from "react-native";
import { Event } from "nostr-tools";
import { useNostrProfile } from "@/hooks";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { useState } from "react";
import { CommentRepliesLink } from "./CommentRepliesLink";
import { ReplyDialog } from "./ReplyDialog";
import { CommentContent } from "./CommentContent";
import { getRootEventId, getITagFromEvent } from "@/utils";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { CommentActionBar } from "./CommentActionBar";

interface CommentRowProps extends ViewProps {
  commentId: string;
  hideReplies?: boolean;
  replies?: Event[];
  showReplyLinks?: boolean;
  isPressable?: boolean;
  showContentDetails?: boolean;
  lastReadDate?: number;
  closeParent?: () => void;
  onPress?: (comment: Event) => void;
}

export const CommentRow = ({
  hideReplies = false,
  commentId,
  replies = [],
  showReplyLinks = true,
  isPressable = true,
  showContentDetails = false,
  lastReadDate,
  closeParent,
  onPress,
}: CommentRowProps) => {
  const router = useRouter();
  const basePathname = useGetBasePathname();
  const { data: comment } = useNostrEvent(commentId);
  const contentId = getITagFromEvent(comment);
  const {
    data: npubMetadata,
    isFetching,
    isLoading,
  } = useNostrProfile(comment?.pubkey);
  const metadataIsLoading = isFetching || isLoading;
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!comment) return null;

  const onReplyPress = () => {
    if (onPress) {
      onPress(comment);
    } else {
      const rootEventId = getRootEventId(comment);
      if (rootEventId) {
        router.push(`${basePathname}/comment/${rootEventId}`);
      }
    }
  };
  const isUnread = lastReadDate ? comment.created_at > lastReadDate : false;

  return (
    <>
      <View
        style={{
          marginBottom: 10,
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: isUnread
            ? "rgba(255, 255, 255, 0.2)"
            : "transparent",
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
        {/* {showReplyLinks && (
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
              replies={replies}
              parentcommentId={comment.id}
            />
          </View>
        )} */}
      </View>
      <CommentActionBar comment={comment} />
    </>
  );
};
