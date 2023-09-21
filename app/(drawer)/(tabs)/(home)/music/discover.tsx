import { TrackList } from "@/components";
import { useNewMusic } from "@/hooks";

export default function DiscoverPage() {
  const { data } = useNewMusic();

  return <TrackList data={data} playerTitle="New music" />;
}
