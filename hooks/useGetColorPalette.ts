import { useState, useEffect } from "react";
import { getColors } from "react-native-image-colors";
import Color from "color";
import { brandColors } from "@/constants";

const NEAR_BLACK_THRESHOLD = 10;
const LIGHTEN_FACTOR = 0.2;
const MIN_DARK_COLOR = brandColors.black.DEFAULT;
const MIN_CONTRAST_RATIO = 4.5;

function getContrastRatio(color1: Color, color2: Color): number {
  const l1 = color1.luminosity();
  const l2 = color2.luminosity();
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function adjustColorForContrast(bgColor: Color, fgColor: Color): Color {
  let adjustedColor = fgColor;
  while (getContrastRatio(bgColor, adjustedColor) < MIN_CONTRAST_RATIO) {
    if (bgColor.isDark()) {
      adjustedColor = adjustedColor.lighten(0.1);
    } else {
      adjustedColor = adjustedColor.darken(0.1);
    }
  }
  return adjustedColor;
}

export const useGetColorPalette = (url: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unmodifiedBackground, setUnmodifiedBackground] = useState<
    string | null
  >(null);
  const [background, setBackground] = useState<string | null>(null);
  const [unmodifiedForeground, setUnmodifiedForeground] = useState<
    string | null
  >(null);
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
        let fgColor: string;
        if (result.platform === "ios") {
          bgColor = result.background;
          fgColor = result.primary;
          setDominant(result.detail);
        } else {
          bgColor = result.darkVibrant;
          fgColor = result.lightVibrant;
          setDominant(result.vibrant);
        }

        const bgColorObj = Color(bgColor);
        const fgColorObj = Color(fgColor);

        setUnmodifiedBackground(bgColor);
        setUnmodifiedForeground(fgColor);

        // Check if background is near black
        const isNearBlack =
          bgColorObj.isDark() && bgColorObj.lightness() < NEAR_BLACK_THRESHOLD;
        setBackgroundIsNearBlack(isNearBlack);

        // Create lightened version of background color
        let lightenedColor = bgColorObj.lighten(LIGHTEN_FACTOR).hex();
        lightenedColor =
          Color(lightenedColor).lightness() > Color(MIN_DARK_COLOR).lightness()
            ? lightenedColor
            : MIN_DARK_COLOR;
        setLightenedBackgroundColor(lightenedColor);

        // Set the background color based on whether it's near black
        setBackground(isNearBlack ? lightenedColor : bgColor);

        // Adjust foreground color for contrast
        const contrastBgColor = isNearBlack
          ? Color(lightenedColor)
          : bgColorObj;
        const adjustedFgColor = adjustColorForContrast(
          contrastBgColor,
          fgColorObj,
        );
        setForeground(adjustedFgColor.hex());
      } catch (error) {
        console.error("Error getting color palette:", error);
      }
      setIsLoading(false);
    };

    getColorPalette();
  }, [url]);

  return {
    background,
    unmodifiedBackground,
    foreground,
    unmodifiedForeground,
    dominant,
    backgroundIsNearBlack,
    isLoading,
  };
};
