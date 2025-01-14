import { FlatList, RefreshControl } from "react-native";
import { memo, useCallback } from "react";
import { SectionHeader } from "../SectionHeader";
import { CommentRow } from "../Comments";
import { Event } from "nostr-tools";
import { ItemSeparator, ListEmpty, ListFooter } from "./common";

export const NonContentTab = ({
  isLoading,
  data,
  lastReadDate,
  refetch,
}: {
  isLoading: boolean;
  data: Event[];
  lastReadDate?: number;
  refetch: () => void;
}) => {
  const MemoizedCommentRow = memo(CommentRow);
  const renderItem = useCallback(({ item: commentId }: { item: string }) => {
    return (
      <MemoizedCommentRow
        commentId={commentId}
        key={commentId}
        showReplyLinks={true}
        lastReadDate={lastReadDate}
      />
    );
  }, []);

  return (
    <FlatList
      ListEmptyComponent={<ListEmpty isLoading={isLoading} />}
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
      ListFooterComponent={<ListFooter numberOfItems={data.length} />}
      scrollEnabled={true}
      windowSize={12}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};
