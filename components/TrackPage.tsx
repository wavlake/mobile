import { useQuery } from "@tanstack/react-query";
import LoadingScreen from "./LoadingScreen";
import { getTrack } from "@/utils";
import { useLocalSearchParams } from "expo-router";
import { useGoToAlbumPage } from "@/hooks";
import { Redirect } from "expo-router";

export const TrackPage = () => {
  const goToAlbumPage = useGoToAlbumPage({ replace: true });
  const { trackId } = useLocalSearchParams();
  const { data: track, isLoading } = useQuery({
    queryKey: [trackId],
    queryFn: () => getTrack(trackId as string),
  });

  if (isLoading) {
    return <LoadingScreen loading />;
  }

  if (track?.albumId) {
    goToAlbumPage(track.albumId, track.albumTitle);
  }

  // fallback to not found page
  return <Redirect href={`/+not-found`} />;
};
