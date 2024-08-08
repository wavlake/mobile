import { ContentComment } from "@/utils";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { FlatList, View } from "react-native";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { SectionHeader } from "../SectionHeader";
import { Text } from "../Text";
import { CommentRow } from "./CommentRow";
import { useRepliesMap } from "@/hooks/useRepliesMap";

interface CommentPageProps {
  isLoading: boolean;
  comments: ContentComment[];
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  fetchNextPage: UseInfiniteQueryResult["fetchNextPage"];
}

export const CommentPage = ({
  isLoading,
  comments,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: CommentPageProps) => {
  const { height } = useMiniMusicPlayer();
  // TODO - improve the performance of this component
  // this may trigger rate limiting if the user scrolls through multiple pages of comments too quickly
  const nostrRepliesMap = useRepliesMap(comments);
  return (
    <View
      style={{ height: "100%", paddingTop: 16, paddingBottom: height + 16 }}
    >
      {isLoading ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Text>Loading comments...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={comments}
            ListHeaderComponent={() => (
              <View>
                <SectionHeader title="Comments" />
              </View>
            )}
            renderItem={({ item, index }) => {
              const isLastComment = index === comments.length - 1;
              const nostrReplies = item.eventId
                ? nostrRepliesMap[item.eventId] ?? []
                : [];

              return (
                <>
                  <CommentRow
                    comment={item}
                    key={item.id}
                    nostrReplies={nostrReplies}
                  />
                  {isFetchingNextPage && isLastComment && (
                    <Text style={{ textAlign: "center" }}>Loading more...</Text>
                  )}
                  {isLastComment && !hasNextPage && (
                    <Text style={{ textAlign: "center" }}>
                      No more comments
                    </Text>
                  )}
                </>
              );
            }}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled
            onEndReached={() => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
          />
        </>
      )}
    </View>
  );
};
