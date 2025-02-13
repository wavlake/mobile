import { CommentRow } from "./CommentRow";
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  TouchableOpacity,
  View,
} from "react-native";
import { SectionHeader } from "../SectionHeader";
import { Text } from "../shared/Text";
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
  onClose,
}: {
  commentIds: string[];
  isLoading: boolean;
  scrollEnabled?: boolean;
  showMoreLink?: {
    pathname: string;
    params: Record<string, string>;
  };
  onClose?: () => void;
}) => {
  const router = useRouter();
  const handleLoadMore = () => {
    if (!showMoreLink) {
      return;
    }
    router.push(showMoreLink);
  };

  const MemoizedCommentRow = memo(CommentRow);
  const renderItem = useCallback(({ item: commentId }: { item: string }) => {
    return (
      <MemoizedCommentRow
        commentId={commentId}
        key={commentId}
        closeParent={onClose}
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
      data={commentIds}
      ListHeaderComponent={() => (
        <SectionHeader
          title="Latest Messages"
          rightButton={
            onClose && (
              <TouchableOpacity hitSlop={20} onPress={onClose}>
                <Text style={{ textAlign: "center" }}>Close</Text>
              </TouchableOpacity>
            )
          }
        />
      )}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      ListFooterComponent={
        commentIds.length > 0 && showMoreLink ? (
          <TouchableOpacity hitSlop={20} onPress={handleLoadMore}>
            <Text style={{ textAlign: "center" }}>View more</Text>
          </TouchableOpacity>
        ) : undefined
      }
      scrollEnabled={scrollEnabled}
      windowSize={12}
      removeClippedSubviews={true}
      maxToRenderPerBatch={8}
    />
  );
};
