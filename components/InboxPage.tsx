import { useInbox } from "@/hooks";
import { Text } from "./shared/Text";
import { ActivityIndicator, FlatList, View } from "react-native";
import { memo, useCallback } from "react";
import { SectionHeader } from "./SectionHeader";
import { CommentRow } from "./Comments";
import { Event } from "nostr-tools";

export const InboxPage = () => {
  const { lastReadDate, directReplies, contentReplies, isLoading } = useInbox();

  const mentions: Event[] = [];

  const MemoizedCommentRow = memo(CommentRow);
  const renderItem = useCallback(({ item: commentId }: { item: string }) => {
    return (
      <MemoizedCommentRow
        commentId={commentId}
        key={commentId}
        showReplyLinks={true}
      />
    );
  }, []);

  return (
    <FlatList
      ListEmptyComponent={
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "white",
              textAlign: "center",
            }}
          >
            {isLoading ? <ActivityIndicator /> : "No comment yet"}
          </Text>
        </View>
      }
      data={[...directReplies, ...mentions, ...contentReplies]
        .sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        })
        .map((event) => event.id)}
      ListHeaderComponent={() => <SectionHeader title="Inbox" />}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      ListFooterComponent={
        <Text style={{ textAlign: "center" }}>End of inbox</Text>
      }
      scrollEnabled={true}
      windowSize={12}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
    />
  );
};
