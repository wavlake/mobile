import { FlatList, RefreshControl } from "react-native";
import { memo, useCallback, useMemo } from "react";
import { SectionHeader } from "../SectionHeader";
import { CommentRow } from "../Comments";
import { ItemSeparator, ListEmpty, ListFooter } from "./common";

export const NonContentTab = ({
  isLoading,
  comments,
  reactions,
  zapReceipts,
  lastReadDate,
  refetch,
}: {
  isLoading: boolean;
  comments: string[];
  reactions: string[];
  zapReceipts: string[];
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
  const events = useMemo(
    () => [...comments, ...reactions, ...zapReceipts],
    [comments, reactions, zapReceipts],
  );
  return (
    <FlatList
      ListEmptyComponent={<ListEmpty isLoading={isLoading} />}
      data={events}
      ListHeaderComponent={() => <SectionHeader title="Inbox" />}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      keyExtractor={(item) => item}
      ListFooterComponent={<ListFooter numberOfItems={events.length} />}
      scrollEnabled={true}
      windowSize={12}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};
