import { CommentRowProps } from "./types";
import { ActivityIndicator, View } from "react-native";
import { EventRenderer } from "./EventRenderer";
import { useNostrEvent } from "@/hooks/useNostrEvent";

export const CommentRow = ({
  commentId,
  comment,
  showContentDetails = false,
  lastReadDate,
  showReplyParent = false,
  closeParent,
  onPress,
}: CommentRowProps) => {
  const { data: event, isPending: isLoading } = useNostrEvent(
    comment?.id ?? commentId,
  );

  if (isLoading)
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

  if (!event) return null;

  const supportedKinds = [1, 6, 9734, 9735];
  const isPressable = supportedKinds.includes(event.kind);

  return (
    <EventRenderer
      comment={event}
      showReplyParent={showReplyParent}
      showContentDetails={showContentDetails}
      lastReadDate={lastReadDate}
      closeParent={closeParent}
      onPress={onPress}
      isPressable={isPressable}
    />
  );
};
