import { Image } from "react-native";

interface ArtistBannerProps {
  uri: string;
  height?: number;
}

export const ArtistBanner = ({ uri, height }: ArtistBannerProps) => {
  return (
    <Image
      source={{ uri }}
      style={{ width: "100%", height, aspectRatio: 16 / 9 }}
      resizeMode="contain"
    />
  );
};
