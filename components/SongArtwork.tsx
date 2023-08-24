import { Image } from "react-native";
import { memo } from "react";

interface SongArtworkProps {
  size: number;
  url: string;
}

export const SongArtwork = memo(({ size, url }: SongArtworkProps) => {
  return <Image source={{ uri: url }} style={{ width: size, height: size }} />;
});
