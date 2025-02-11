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
import { useNostrEvents } from "@/providers/NostrEventProvider";
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

export const CommentRow = ({
  commentId,
  comment,
  isPressable = true,
  showContentDetails = false,
  lastReadDate,
  showReplyParent = false,
  closeParent,
  onPress,
}: CommentRowProps) => {
  const { getEventAsync } = useNostrEvents();
  const [event, setEvent] = useState<Event | undefined | null>(comment);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (comment) {
      setIsLoading(false);
    }

    if (!commentId) return;
    getEventAsync(commentId).then((event) => {
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
        isPressable={isPressable}
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
        isPressable={isPressable}
        showContentDetails={showContentDetails}
        lastReadDate={lastReadDate}
        closeParent={closeParent}
        onPress={onPress}
        key={event.id}
      />
    );
  }

  console.log("event kind not yet supported", event.kind, event.content);
  return null;
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
  const { data: replyToMetadata, isLoading: replyToMetadataIsLoading } =
    useNostrProfile(replyParent?.pubkey);
  const contentId = getITagFromEvent(comment);
  const {
    data: npubMetadata,
    isFetching,
    isLoading,
  } = useNostrProfile(comment?.pubkey);

  const metadataIsLoading = isFetching || isLoading;
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!comment) return null;

  const onCommentPress = () => {
    if (onPress) {
      onPress(comment);
    } else {
      if (replyParent) {
        router.push(`${basePathname}/comment/${replyParent.id}`);
      }
    }
  };
  const isUnread = lastReadDate ? comment.created_at > lastReadDate : false;

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
        {isPressable ? (
          <TouchableOpacity
            onPress={onCommentPress}
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
      </View>
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
    </>
  );
};
