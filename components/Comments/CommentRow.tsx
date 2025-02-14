import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import { Event } from "nostr-tools";
import { useNostrProfile } from "@/hooks";
import { useEffect, useState } from "react";
import { ReplyDialog } from "./ReplyDialog";
import { Text } from "../shared/Text";
import { CommentContent } from "./CommentContent";
import { getITagFromEvent } from "@/utils";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { useNostrEvents } from "@/providers";
import { CommentActionBar } from "./CommentActionBar";
import { useEventRelatedEvents } from "@/hooks/useEventRelatedEvents";
import { PulsatingEllipsisLoader } from "../PulsatingEllipsisLoader";

interface CommentRowProps extends ViewProps {
  commentId?: string;
  comment?: Event;
  isPressable?: boolean;
  showContentDetails?: boolean;
  lastReadDate?: number;
  showReplyParent?: boolean;
  closeParent?: () => void;
  onPress?: (comment: Event) => void;
}

// TODO - remove contentId from CommentRow, use comment
export const CommentRow = ({
  commentId,
  comment,
  showContentDetails = false,
  lastReadDate,
  showReplyParent = false,
  closeParent,
  onPress,
}: CommentRowProps) => {
  const { getEventFromId } = useNostrEvents();
  const [event, setEvent] = useState<Event | undefined | null>(comment);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (comment) {
      setIsLoading(false);
    }

    if (!commentId) return;
    getEventFromId(commentId).then((event) => {
      setEvent(event);
      setIsLoading(false);
    });
  }, [commentId]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          height: 80,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!event) {
    return null;
  }

  if (event.kind === 1) {
    return (
      <EventRenderer
        showReplyParent={showReplyParent}
        comment={event}
        showContentDetails={showContentDetails}
        lastReadDate={lastReadDate}
        closeParent={closeParent}
        onPress={onPress}
        key={event.id}
      />
    );
  }

  if (event.kind === 9734) {
    return (
      <EventRenderer
        comment={event}
        showContentDetails={showContentDetails}
        lastReadDate={lastReadDate}
        closeParent={closeParent}
        onPress={onPress}
        key={event.id}
      />
    );
  }

  if (event.kind === 9735) {
    // TODO - implement zap rendering in the feed
    return null;
  }

  if (event.kind === 6 || event.kind === 16) {
    // TODO - implement reposts/generic reposts rendering in the feed
    return null;
  }
  return (
    <EventRenderer
      comment={event}
      lastReadDate={lastReadDate}
      closeParent={closeParent}
      key={event.id}
      isPressable={false}
    />
  );
};

const EventRenderer = ({
  comment,
  isPressable = true,
  showContentDetails = false,
  showReplyParent,
  lastReadDate,
  closeParent,
  onPress,
}: Omit<CommentRowProps, "commentId"> & { comment: Event }) => {
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
  const router = useRouter();
  const basePathname = useGetBasePathname();
  const {
    data: parentProfileEvent,
    decodeProfileMetadata,
    isLoading: replyToMetadataIsLoading,
  } = useNostrProfile(replyParent?.pubkey);
  const replyToMetadata = decodeProfileMetadata(parentProfileEvent);
  const contentId = getITagFromEvent(comment);
  const {
    data: authorProfileEvent,
    isFetching,
    isLoading,
  } = useNostrProfile(comment?.pubkey);
  const authorProfile = decodeProfileMetadata(authorProfileEvent);
  const metadataIsLoading = isFetching || isLoading;
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!comment) return null;

  const isUnread = lastReadDate ? comment.created_at > lastReadDate : false;

  const onCommentPress = (comment: Event) => {
    if (!isPressable) return;

    if (onPress) {
      onPress(comment);
      return;
    }

    // fallback is to navigate to the comment page
    router.push({
      pathname: `${basePathname}/comment/${comment.id}`,
      params: { includeBackButton: "true" },
    });
  };

  return (
    <>
      <ReplyDialog
        setIsOpen={setDialogOpen}
        commentId={comment.id}
        isOpen={dialogOpen}
      />
      {showReplyParent && replyParent && (
        <TouchableOpacity
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            paddingVertical: 8,
          }}
          onPress={() => {
            router.push(`${basePathname}/comment/${replyParent.id}`);
          }}
        >
          <Text>Replying to:</Text>
          {replyToMetadataIsLoading ? (
            <PulsatingEllipsisLoader />
          ) : (
            <Text bold>{replyToMetadata?.name ?? "unknown"}</Text>
          )}
        </TouchableOpacity>
      )}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingTop: 8,
          backgroundColor: isUnread
            ? "rgba(255, 255, 255, 0.2)"
            : "transparent",
        }}
      >
        <TouchableOpacity
          onPress={() => onCommentPress(comment)}
          onLongPress={() => {
            if (comment.kind === 1) {
              setDialogOpen(true);
            }
          }}
          style={{ flex: 1 }}
        >
          <CommentContent
            associatedContentId={showContentDetails ? contentId : undefined}
            comment={comment}
            npubMetadata={authorProfile}
            metadataIsLoading={metadataIsLoading}
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
    </>
  );
};
