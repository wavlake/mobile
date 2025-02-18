import { Event } from "nostr-tools";
import { useState, useEffect } from "react";
import { CommentRowProps } from "./types";
import { useNostrEvents } from "@/providers";
import { ActivityIndicator, View } from "react-native";
import { EventRenderer } from "./EventRenderer";

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
      return;
    }

    if (!commentId) return;

    const fetchEvent = async () => {
      const fetchedEvent = await getEventFromId(commentId);
      setEvent(fetchedEvent);
      setIsLoading(false);
    };

    fetchEvent();
  }, [commentId, comment]);

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
