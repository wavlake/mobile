import { useLocalSearchParams } from "expo-router";
import { CommentList } from "./Comments/CommentList";
import { View } from "react-native";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";
import { useTrackComments } from "@/hooks";

export const TrackCommentsPage = () => {
  const { trackId } = useLocalSearchParams();
  const { data: commentIds = [], isFetching } = useTrackComments(
    trackId as string,
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
