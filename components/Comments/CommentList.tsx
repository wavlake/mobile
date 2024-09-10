import { CommentRow } from "./CommentRow";
import { useRepliesMap } from "@/hooks/useRepliesMap";
import {
  ActivityIndicator,
  FlatListProps,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SectionHeader } from "../SectionHeader";
import { Text } from "../Text";
import { useRouter } from "expo-router";
import { memo, useCallback } from "react";

const getItemLayout: FlatListProps<string>["getItemLayout"] = (
  data,
  index,
) => ({
  length: 200, // Replace with your item's height
  offset: 100 * index,
  index,
});

export const CommentList = ({
  commentIds,
  isLoading,
  scrollEnabled = false,
  showMoreLink,
}: {
  commentIds: string[];
  isLoading: boolean;
  scrollEnabled?: boolean;
  showMoreLink?: {
    pathname: string;
    params: Record<string, string>;
  };
}) => {
  const router = useRouter();
  const { data: repliesMap = {} } = useRepliesMap(commentIds);
  const handleLoadMore = () => {
    if (!showMoreLink) {
      return;
    }
    router.push(showMoreLink);
  };

  const MemoizedCommentRow = memo(CommentRow);
  const renderItem = useCallback(
    ({ item: commentId, index }: { item: string; index: number }) => {
      const replies = commentId ? repliesMap[commentId] ?? [] : [];
      return (
        <MemoizedCommentRow
          commentId={commentId}
          key={commentId}
          replies={replies}
        />
      );
    },
    [repliesMap],
  );

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
      data={commentIds}
      ListHeaderComponent={() => (
        <View>
          <SectionHeader title="Latest Messages" />
        </View>
      )}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      ListFooterComponent={
        commentIds.length > 0 && showMoreLink ? (
          <TouchableOpacity onPress={handleLoadMore}>
            <Text style={{ textAlign: "center" }}>View more</Text>
          </TouchableOpacity>
        ) : undefined
      }
      scrollEnabled={scrollEnabled}
      // TODO - investigate additional optimizations
      // getItemLayout={getItemLayout}
      // updateCellsBatchingPeriod={50}
      windowSize={12}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
    />
  );
};
