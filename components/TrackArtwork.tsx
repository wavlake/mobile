import { Image } from "react-native";
import { memo } from "react";

interface TrackArtworkProps {
  size: number;
  url: string;
}

export const TrackArtwork = memo(({ size, url }: TrackArtworkProps) => {
  return <Image source={{ uri: url }} style={{ width: size, height: size }} />;
});
