import { getArtist, getArtistTracks } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { CommentList } from "./Comments/CommentList";
import { View } from "react-native";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";

export const ArtistCommentPage = () => {
  const { artistId } = useLocalSearchParams();
  const { data: artist } = useQuery({
    queryKey: [artistId],
    queryFn: () => getArtist(artistId as string),
  });
  const { data: tracks = [] } = useQuery({
    queryKey: [artistId, "tracks"],
    queryFn: () => getArtistTracks(artistId as string),
  });
  const isVerified = artist?.verified ?? false;
  const router = useRouter();
  useEffect(() => {
    if (isVerified) {
      router.setParams({ includeHeaderTitleVerifiedBadge: "1" });
    }
  }, [isVerified]);

  const trackIds = tracks.map((track) => track.id);
  const { height } = useMiniMusicPlayer();

  return (
    <View
      style={{ height: "100%", paddingTop: 16, paddingBottom: height + 16 }}
    >
      <CommentList
        scrollEnabled={true}
        contentIds={trackIds}
        parentContentId={artistId as string}
        showViewMoreLink={false}
      />
    </View>
  );
};
