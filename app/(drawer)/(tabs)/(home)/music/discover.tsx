import { TrackList, useMusicPlayer } from "@/components";
import { useNewMusic } from "@/hooks";

export default function DiscoverPage() {
  const { data = [] } = useNewMusic();
  const { loadTrackList } = useMusicPlayer();

  return (
    <TrackList
      data={data}
      playerTitle="New music"
      loadTrackList={loadTrackList}
    />
  );
}
