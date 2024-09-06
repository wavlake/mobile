import { getAlbumTracks } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { CommentList } from "./Comments/CommentList";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";

export const AlbumCommentPage = () => {
  const { albumId } = useLocalSearchParams();

  const { data: tracks = [] } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => getAlbumTracks(albumId as string),
  });
  const { height } = useMiniMusicPlayer();

  return (
    <View
      style={{ height: "100%", paddingTop: 16, paddingBottom: height + 16 }}
    >
      <CommentList
        scrollEnabled={true}
        contentIds={tracks.map((track) => track.id)}
        parentContentId={albumId as string}
        showViewMoreLink={false}
      />
    </View>
  );
};
