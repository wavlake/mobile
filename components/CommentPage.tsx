import {
  Text,
  CommentRow,
  SectionHeader,
  useMiniMusicPlayer,
} from "@/components";
import { ContentComment } from "@/utils";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { FlatList, View } from "react-native";

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
              return (
                <>
                  <CommentRow comment={item} key={item.id} />
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
