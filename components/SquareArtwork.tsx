import { Image } from "react-native";
import { memo } from "react";

interface SquereArtworkProps {
  size: number;
  url: string;
}

export const SquareArtwork = memo(({ size, url }: SquereArtworkProps) => {
  return <Image source={{ uri: url }} style={{ width: size, height: size }} />;
});
