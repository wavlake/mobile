import { FlatList, RefreshControl } from "react-native";
import { memo, useCallback } from "react";
import { SectionHeader } from "../SectionHeader";
import { CommentRow } from "../Comments";
import { Event } from "nostr-tools";
import { getITagFromEvent } from "@/utils";
import { useRouter } from "expo-router";
import { useToast } from "@/hooks";
import { useContentDetails } from "@/hooks/useContentDetails";
import { ItemSeparator, ListEmpty, ListFooter } from "./common";

export const ContentTab = ({
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
  const toast = useToast();
  const router = useRouter();
  const MemoizedCommentRow = memo(CommentRow);
  const { fetchContentDetails } = useContentDetails();
  const renderItem = useCallback(({ item: commentId }: { item: string }) => {
    const onPress = async (event: Event) => {
      try {
        const contentId = getITagFromEvent(event);
        if (!contentId) {
          toast.show("Content tag not found");
          return;
        }

        const { type, metadata } = await fetchContentDetails(contentId);

        router.push({
          pathname: `/inbox/${type}/${contentId}`,
          params: {
            includeBackButton: "true",
            headerTitle: metadata.title,
          },
        });
      } catch (error) {
        toast.show("Error fetching content details");
        console.error(error);
      }
    };

    return (
      <MemoizedCommentRow
        showContentDetails
        commentId={commentId}
        key={commentId}
        showReplyLinks={true}
        onPress={onPress}
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
      keyExtractor={(item) => item}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      ListFooterComponent={<ListFooter numberOfItems={data.length} />}
      scrollEnabled={true}
      windowSize={12}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};
