import { TrackList, useMusicPlayer } from "@/components";
import { useLibraryTracks } from "@/hooks";
export default function RecentSongsPage() {
  const { data: tracks = [] } = useLibraryTracks();
  const { loadTrackList } = useMusicPlayer();

  return (
    <TrackList
      data={tracks}
      playerTitle="Recent songs"
      loadTrackList={loadTrackList}
    />
  );
}
