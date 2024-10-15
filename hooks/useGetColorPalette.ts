import { useState, useEffect } from "react";
import { getColors } from "react-native-image-colors";
import Color from "color";
import { brandColors } from "@/constants";

const NEAR_BLACK_THRESHOLD = 10;
const LIGHTEN_FACTOR = 0.2;
const MIN_DARK_COLOR = brandColors.black.DEFAULT;

export const useGetColorPalette = (url: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [background, setBackground] = useState<string | null>(null);
  const [foreground, setForeground] = useState<string | null>(null);
  const [dominant, setDominant] = useState<string | null>(null);
  const [backgroundIsNearBlack, setBackgroundIsNearBlack] =
    useState<boolean>(false);
  const [lightenedBackgroundColor, setLightenedBackgroundColor] = useState<
    string | null
  >(null);

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

        let bgColor: string;
        if (result.platform === "ios") {
          bgColor = result.background;
          setBackground(bgColor);
          setForeground(result.primary);
          setDominant(result.detail);
        } else {
          bgColor = result.darkVibrant;
          setBackground(bgColor);
          setForeground(result.lightVibrant);
          setDominant(result.vibrant);
        }

        // Check if background is near black
        const colorObj = Color(bgColor);
        setBackgroundIsNearBlack(
          colorObj.isDark() && colorObj.lightness() < NEAR_BLACK_THRESHOLD,
        );

        // Create lightened version of background color
        const lightenedColor = colorObj.lighten(LIGHTEN_FACTOR).hex();

        // Use the maximum of lightenedColor and MIN_DARK_COLOR
        const finalLightenedColor =
          Color(lightenedColor).lightness() > Color(MIN_DARK_COLOR).lightness()
            ? lightenedColor
            : MIN_DARK_COLOR;

        setLightenedBackgroundColor(finalLightenedColor);
      } catch (error) {
        console.error("Error getting color palette:", error);
      }
      setIsLoading(false);
    };

    getColorPalette();
  }, [url]);

  return {
    background,
    foreground,
    dominant,
    backgroundIsNearBlack,
    lightenedBackgroundColor,
    isLoading,
  };
};
