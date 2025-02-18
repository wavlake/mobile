// components/comments/EventRenderer.tsx
import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Event } from "nostr-tools";
import { Text } from "../shared/Text";
import { useDecodedProfile } from "@/hooks";
import { useEventRelatedEvents } from "@/hooks/useEventRelatedEvents";
import { CommentContent } from "./CommentContent";
import { CommentActionBar } from "./CommentActionBar";
import { ReplyDialog } from "./ReplyDialog";
import { PulsatingEllipsisLoader } from "../PulsatingEllipsisLoader";
import { getITagFromEvent } from "@/utils";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { useRouter } from "expo-router";

interface EventRendererProps {
  comment: Event;
  isPressable?: boolean;
  showContentDetails?: boolean;
  showReplyParent?: boolean;
  lastReadDate?: number;
  closeParent?: () => void;
  onPress?: (comment: Event) => void;
}

export const EventRenderer = ({
  comment,
  isPressable = true,
  showContentDetails = false,
  showReplyParent = false,
  lastReadDate,
  closeParent,
  onPress,
}: EventRendererProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const basePathname = useGetBasePathname();

  const navigateToComment = (commentId: string, includeBackButton = true) => {
    router.push({
      pathname: `${basePathname}/comment/${commentId}`,
      params: { includeBackButton: includeBackButton.toString() },
    });
  };

  const {
    refetch,
    reposts,
    reactions,
    zapReceipts,
    directReplies,
    genericReposts,
    zapTotal,
    userHasReacted,
    userHasZapped,
    replyParent,
  } = useEventRelatedEvents(comment);

  const { data: replyToMetadata, isLoading: replyToMetadataIsLoading } =
    useDecodedProfile(replyParent?.pubkey);
  const contentId = getITagFromEvent(comment);
  const isUnread = lastReadDate ? comment.created_at > lastReadDate : false;

  const handleCommentPress = () => {
    if (!isPressable) return;

    if (onPress) {
      onPress(comment);
      return;
    }

    navigateToComment(comment.id);
  };

  const handleLongPress = () => {
    if (comment.kind === 1) {
      setDialogOpen(true);
    }
  };

  return (
    <View
      style={{
        backgroundColor: isUnread ? "rgba(255, 255, 255, 0.2)" : "transparent",
        marginHorizontal: 8,
        gap: 6,
      }}
    >
      <ReplyDialog
        setIsOpen={setDialogOpen}
        commentId={comment.id}
        isOpen={dialogOpen}
      />

      {showReplyParent && replyParent && (
        <ReplyParentInfo
          replyParent={replyParent}
          replyToMetadata={replyToMetadata}
          isLoading={replyToMetadataIsLoading}
          onPress={() => navigateToComment(replyParent.id)}
        />
      )}

      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={handleCommentPress}
          onLongPress={handleLongPress}
          style={{ flex: 1 }}
        >
          <CommentContent
            associatedContentId={showContentDetails ? contentId : undefined}
            comment={comment}
            closeParent={closeParent}
          />
        </TouchableOpacity>
      </View>

      {comment.kind === 1 && (
        <CommentActionBar
          comment={comment}
          reposts={reposts}
          replies={directReplies}
          reactions={reactions}
          zapReceipts={zapReceipts}
          genericReposts={genericReposts}
          zapTotal={zapTotal}
          userHasReacted={userHasReacted}
          userHasZapped={userHasZapped}
        />
      )}
    </View>
  );
};

interface ReplyParentInfoProps {
  replyParent: Event;
  replyToMetadata: any; // Type should match your metadata structure
  isLoading: boolean;
  onPress: () => void;
}

const ReplyParentInfo = ({
  replyParent,
  replyToMetadata,
  isLoading,
  onPress,
}: ReplyParentInfoProps) => (
  <TouchableOpacity
    style={{
      display: "flex",
      flexDirection: "row",
      gap: 2,
    }}
    onPress={onPress}
  >
    <Text>Replying to:</Text>
    {isLoading ? (
      <PulsatingEllipsisLoader />
    ) : (
      <Text bold>{replyToMetadata?.name ?? "unknown"}</Text>
    )}
  </TouchableOpacity>
);
