import { TrackList } from "@/components";
import { useLibraryTracks } from "@/hooks";
export default function RecentSongsPage() {
  const { data: tracks = [] } = useLibraryTracks();

  return <TrackList data={tracks} playerTitle="Recent songs" />;
}
