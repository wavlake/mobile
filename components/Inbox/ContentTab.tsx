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
import { getContentType, getITagFromEvent } from "@/utils";
import { useRouter } from "expo-router";
import { useToast } from "@/hooks";

export const ContentTab = ({
  isLoading,
  data,
  refetch,
}: {
  isLoading: boolean;
  data: Event[];
  refetch: () => void;
}) => {
  const toast = useToast();
  const router = useRouter();
  const MemoizedCommentRow = memo(CommentRow);
  const renderItem = useCallback(({ item: commentId }: { item: string }) => {
    const onPress = async (event: Event) => {
      const contentId = getITagFromEvent(event);
      if (!contentId) {
        toast.show("Content tag not found");
        return;
      }
      const { type, metadata } = await getContentType(contentId);

      router.push({
        pathname: `/inbox/${type}/${contentId}`,
        params: {
          includeBackButton: "true",
          headerTitle: metadata.title,
        },
      });
    };

    return (
      <MemoizedCommentRow
        commentId={commentId}
        key={commentId}
        showReplyLinks={true}
        onPress={onPress}
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
      keyExtractor={(item) => item}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      ListFooterComponent={
        data.length === 0 ? null : (
          <Text style={{ marginTop: 40, textAlign: "center" }}>
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
