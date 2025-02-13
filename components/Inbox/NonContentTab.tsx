import { FlatList, RefreshControl } from "react-native";
import { memo, useCallback, useMemo } from "react";
import { SectionHeader } from "../SectionHeader";
import { CommentRow } from "../Comments";
import { ItemSeparator, ListEmpty, ListFooter } from "./common";
import { Event } from "nostr-tools";

export const NonContentTab = ({
  isLoading,
  comments,
  reactions,
  zapReceipts,
  lastReadDate,
  refetch,
}: {
  isLoading: boolean;
  comments: Event[];
  reactions: Event[];
  zapReceipts: Event[];
  lastReadDate?: number;
  refetch: () => void;
}) => {
  const MemoizedCommentRow = memo(CommentRow);
  const renderItem = useCallback(({ item: event }: { item: Event }) => {
    return (
      <MemoizedCommentRow
        showReplyParent
        comment={event}
        key={event.id}
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
      keyExtractor={(item) => item.id}
      ListFooterComponent={<ListFooter numberOfItems={events.length} />}
      scrollEnabled={true}
      windowSize={4}
      removeClippedSubviews={true}
      maxToRenderPerBatch={2}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};
