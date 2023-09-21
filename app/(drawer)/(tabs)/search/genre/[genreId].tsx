import { TrackList } from "@/components";
import { getRandomGenreTracks } from "@/utils";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

export default function GenrePage() {
  const { genreId, name } = useLocalSearchParams();
  const { data = [] } = useQuery({
    queryKey: ["genre", genreId],
    queryFn: () => getRandomGenreTracks(genreId as string),
  });

  return <TrackList data={data} playerTitle={name as string} />;
}
