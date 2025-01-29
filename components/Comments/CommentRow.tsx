import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import { Event } from "nostr-tools";
import { useNostrProfile } from "@/hooks";
import { useEffect, useState } from "react";
import { CommentRepliesLink } from "./CommentRepliesLink";
import { ReplyDialog } from "./ReplyDialog";
import { CommentContent } from "./CommentContent";
import { getRootEventId, getITagFromEvent } from "@/utils";
import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { useNostrEvents } from "@/providers/NostrEventProvider";

interface CommentRowProps extends ViewProps {
  commentId: string;
  replies?: Event[];
  showReplyLinks?: boolean;
  isPressable?: boolean;
  showContentDetails?: boolean;
  lastReadDate?: number;
  closeParent?: () => void;
  onPress?: (comment: Event) => void;
}
export const CommentRow = ({
  commentId,
  replies = [],
  showReplyLinks = true,
  isPressable = true,
  showContentDetails = false,
  lastReadDate,
  closeParent,
  onPress,
}: CommentRowProps) => {
  const { getEventAsync } = useNostrEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
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
      <Kind1Event
        comment={event}
        replies={replies}
        showReplyLinks={showReplyLinks}
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

const Kind1Event = ({
  comment,
  replies = [],
  showReplyLinks = true,
  isPressable = true,
  showContentDetails = false,
  lastReadDate,
  closeParent,
  onPress,
}: Omit<CommentRowProps, "commentId"> & { comment: Event }) => {
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
    <View
      style={{
        marginBottom: 10,
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: isUnread ? "rgba(255, 255, 255, 0.2)" : "transparent",
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
