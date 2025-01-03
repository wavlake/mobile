import { Text } from "../shared/Text";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { memo, useCallback } from "react";
import { SectionHeader } from "../SectionHeader";
import { CommentRow } from "../Comments";
import { Event } from "nostr-tools";

export const NonContentTab = ({
  isLoading,
  data,
  refetch,
}: {
  isLoading: boolean;
  data: Event[];
  refetch: () => void;
}) => {
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
      data={data
        .sort((a, b) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        })
        .map((event) => event.id)}
      ListHeaderComponent={() => <SectionHeader title="Inbox" />}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      keyExtractor={(item) => item}
      ListFooterComponent={
        data.length === 0 ? null : (
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            End of inbox
          </Text>
        )
      }
      scrollEnabled={true}
      windowSize={12}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
    />
  );
};
