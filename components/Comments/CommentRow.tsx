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
import { CommentContent } from "./CommentContent";
import { getRootEventId, getITagFromEvent } from "@/utils";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { useNostrEvents } from "@/providers/NostrEventProvider";
import { CommentActionBar } from "./CommentActionBar";
import { useEventRelatedEvents } from "@/hooks/useEventRelatedEvents";

interface CommentRowProps extends ViewProps {
  commentId?: string;
  comment?: Event;
  replies?: Event[];
  isPressable?: boolean;
  showContentDetails?: boolean;
  lastReadDate?: number;
  closeParent?: () => void;
  onPress?: (comment: Event) => void;
}

export const CommentRow = ({
  commentId,
  comment,
  isPressable = true,
  showContentDetails = false,
  lastReadDate,
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
  lastReadDate,
  closeParent,
  onPress,
}: Omit<CommentRowProps, "commentId"> & { comment: Event }) => {
  const {
    refetch,
    reposts,
    reactions,
    zapReceipts,
    replies,
    genericReposts,
    zapTotal,
    userHasReacted,
    userHasZapped,
  } = useEventRelatedEvents(comment);

  const router = useRouter();
  const basePathname = useGetBasePathname();
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
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingTop: 8,
          backgroundColor: isUnread
            ? "rgba(255, 255, 255, 0.2)"
            : "transparent",
        }}
      >
        <ReplyDialog
          setIsOpen={setDialogOpen}
          commentId={comment.id}
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
      </View>
      <CommentActionBar
        comment={comment}
        reposts={reposts}
        replies={replies}
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
