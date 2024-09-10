import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { CommentList } from "./Comments/CommentList";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";
import { useAlbumComments } from "@/hooks/useAlbumComments";

export const AlbumCommentPage = () => {
  const { albumId } = useLocalSearchParams();
  const { data: commentIds = [], isFetching } = useAlbumComments(
    albumId as string,
  );
  const { height } = useMiniMusicPlayer();

  return (
    <View
      style={{ height: "100%", paddingTop: 16, paddingBottom: height + 16 }}
    >
      <CommentList
        scrollEnabled={true}
        commentIds={commentIds}
        isLoading={isFetching}
      />
    </View>
  );
};
