import { LibrarySongsPage, useMusicPlayer } from "@/components";

export default function SongsPage() {
  const { loadTrackList } = useMusicPlayer();

  return <LibrarySongsPage loadTrackList={loadTrackList} />;
}
