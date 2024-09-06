import { FlatList, View } from "react-native";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { SectionHeader } from "../SectionHeader";
import { Text } from "../Text";
import { CommentRow } from "./CommentRow";
import { useRepliesMap } from "@/hooks/useRepliesMap";
import { Event } from "nostr-tools";
interface CommentPageProps {
  isLoading: boolean;
  comments: Event[];
}

export const CommentPage = ({ isLoading, comments }: CommentPageProps) => {
  const { height } = useMiniMusicPlayer();
  // TODO - improve the performance of this component
  // this may trigger rate limiting if the user scrolls through multiple pages of comments too quickly
  const repliesMap = useRepliesMap(comments);
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
              const replies = item.id ? repliesMap[item.id] ?? [] : [];

              return (
                <CommentRow comment={item} key={item.id} replies={replies} />
              );
            }}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled
          />
        </>
      )}
    </View>
  );
};
