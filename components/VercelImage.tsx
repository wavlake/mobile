import {
  ActivityIndicator,
  Image,
  View,
  StyleSheet,
  PixelRatio,
} from "react-native";
import { memo, useState } from "react";

interface SquereArtworkProps {
  size: number;
  url: string;
  quality?: number;
}

// Convert dp to pixels by multiplying with pixel ratio
function getNearestImageSize(dpSize: number) {
  const pixelSize = PixelRatio.getPixelSizeForLayoutSize(dpSize);
  const imageSizes = [16, 32, 48, 64, 96, 128, 256, 384, 1920];
  return (
    imageSizes.find((imageSize) => imageSize >= pixelSize) ||
    imageSizes[imageSizes.length - 1]
  );
}
const VERCEL_IMAGE_URL = "https://wavlake.com/_next/image?url=";

export const VercelImage = memo(
  ({ size, url, quality }: SquereArtworkProps) => {
    const imageSize = getNearestImageSize(size);
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
