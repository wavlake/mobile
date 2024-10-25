import { ActivityIndicator, Image, View, StyleSheet } from "react-native";
import { memo, useState } from "react";

interface SquereArtworkProps {
  size: number;
  url: string;
  quality?: number;
}

function getNearestImageSize(size: number) {
  const imageSizes = [16, 32, 48, 64, 96, 128, 256, 384, 1920];
  return (
    imageSizes.find((imageSize) => imageSize >= size) ||
    imageSizes[imageSizes.length - 1]
  );
}
const VERCEL_IMAGE_URL = "https://wavlake.com/_next/image?url=";

const REACT_NATIVE_UNIT_FACTOR = 1.5;
export const VercelImage = memo(
  ({ size, url, quality }: SquereArtworkProps) => {
    const imageSize = getNearestImageSize(size * REACT_NATIVE_UNIT_FACTOR);
    const uri = `${VERCEL_IMAGE_URL}${encodeURIComponent(
      url,
    )}&w=${imageSize}&q=${quality ?? 100}`;
    const [loading, setLoading] = useState(true);

    return (
      <View style={styles.container}>
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          onLoadStart={() => {
            setLoading(true);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
          }}
        />
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" />
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
