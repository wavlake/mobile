import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";

export const useGetColorPalette = (url: string) => {
  const [background, setBackground] = useState<string | null>(null);
  const [foreground, setForeground] = useState<string | null>(null);
  const [dominant, setDominant] = useState<string | null>(null);

  useEffect(() => {
    const getColorPalette = async () => {
      try {
        const result = await getColors(url, {
          fallback: "#000000",
          quality: "low",
          pixelSpacing: 5,
          cache: true,
          key: url,
        });

        if (result.platform === "ios") {
          setBackground(result.background);
          setForeground(result.primary);
          setDominant(result.detail);
        } else {
          setBackground(result.darkVibrant);
          setForeground(result.lightVibrant);
          setDominant(result.vibrant);
        }
      } catch (error) {
        console.error("Error getting color palette:", error);
      }
    };

    getColorPalette();
  }, [url]);

  return {
    background,
    foreground,
    dominant,
  };
};
