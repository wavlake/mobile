import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "./LoadingScreen";
import { getTrack } from "@/utils";
import { useTrackComments } from "@/hooks";
import { Redirect } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { Dimensions, View } from "react-native";
import { Text } from "./shared/Text";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { ContentPageButtons } from "./ContentPageButtons";
import { SquareArtwork } from "./SquareArtwork";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { CommentList } from "./Comments/CommentList";
import { ScrollView } from "react-native-gesture-handler";

export const TrackPage = () => {
  const basePathname = useGetBasePathname();
  const { loadTrackList } = useMusicPlayer();
  const { trackId: trackIdParam } = useLocalSearchParams();
  const trackId = trackIdParam as string;
  const { data: track, isLoading } = useQuery({
    queryKey: [trackId],
    queryFn: () => getTrack(trackId as string),
  });
  const { data: commentIds = [], isFetching } = useTrackComments(trackId, 10);
  const screenWidth = Dimensions.get("window").width;

  if (isLoading) {
    return <LoadingScreen loading />;
  }

  if (!track) {
    return <Redirect href="/+not-found" />;
  }

  const onPlay = () => {
    loadTrackList({
      trackList: [track],
      trackListId: trackId as string,
      startIndex: 0,
      playerTitle: track.title,
    });
  };

  return (
    <ScrollView style={{ marginBottom: 36 }}>
      <SquareArtwork size={screenWidth} url={track.artworkUrl} />
      <ContentPageButtons
        contentType="track"
        shareUrl={`https://wavlake.com/track/${trackId}`}
        content={track}
        trackListId={track.id}
        trackListTitle={track.title}
        onPlay={onPlay}
      />
      <View>
        <Text>Song</Text>
        <Text style={{ fontSize: 24 }} bold>
          {track.title}
        </Text>
        <Text style={{ fontSize: 16 }}>
          {track.artist} - {track.albumTitle}
        </Text>
      </View>
      <CommentList
        commentIds={commentIds}
        isLoading={isFetching}
        showMoreLink={{
          pathname: `${basePathname}/track/[trackId]/comments`,
          params: {
            trackId,
            headerTitle: `Comments for ${track.title}`,
            includeBackButton: "true",
          },
        }}
      />
    </ScrollView>
  );
};
