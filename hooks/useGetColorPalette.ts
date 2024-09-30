import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";

const MINIMUM_CONTRAST_RATIO = 4.5; // WCAG AA compliance
const NEAR_BLACK_THRESHOLD = 0.1; // Luminance threshold for "near black"

export const useGetColorPalette = (url: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [background, setBackground] = useState<string | null>(null);
  const [foreground, setForeground] = useState<string | null>(null);
  const [dominant, setDominant] = useState<string | null>(null);
  const [backgroundIsBlack, setBackgroundIsBlack] = useState<boolean>(false);
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

        if (result.platform === "ios") {
          setBackground(result.background);
          setForeground(result.primary);
          setDominant(result.detail);
        } else {
          setBackground(result.darkVibrant);
          setForeground(result.lightVibrant);
          setDominant(result.vibrant);
        }

        // Check and ensure sufficient contrast
        if (
          background &&
          foreground &&
          getContrastRatio(
            hexToLuminance(background),
            hexToLuminance(foreground),
          ) < MINIMUM_CONTRAST_RATIO
        ) {
          const highContrastBackground = getHighContrastColor(
            background,
            foreground,
          );
          setBackground(highContrastBackground);
          setLightenedBackgroundColor(highContrastBackground);
          setForeground(
            getHighContrastColor(foreground, highContrastBackground),
          );
        } else {
          setLightenedBackgroundColor(background || null);
        }

        // Check if the background is near black
        if (background) {
          const luminance = hexToLuminance(background);
          setBackgroundIsBlack(luminance <= NEAR_BLACK_THRESHOLD);
          if (luminance <= NEAR_BLACK_THRESHOLD) {
            setLightenedBackgroundColor(getLightenedColor(background));
          }
        }
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
    backgroundIsBlack,
    lightenedBackgroundColor,
    isLoading,
  };
};

const getHighContrastColor = (color1: string, color2: string) => {
  const ratio = getContrastRatio(
    hexToLuminance(color1),
    hexToLuminance(color2),
  );
  if (ratio < MINIMUM_CONTRAST_RATIO) {
    // Adjust the color to ensure sufficient contrast
    return adjustColorContrast(color1, color2);
  }
  return color1;
};

const adjustColorContrast = (color1: string, color2: string) => {
  // Convert the colors to HSL
  const hsl1 = hexToHsl(color1);
  const hsl2 = hexToHsl(color2);

  // Calculate the lightness difference
  const lightnessDiff = Math.abs(hsl1.l - hsl2.l);

  // If the lightness difference is too small, adjust the lightness
  if (lightnessDiff < 0.3) {
    if (hsl1.l < hsl2.l) {
      hsl1.l = Math.min(hsl1.l + 0.3, 1);
    } else {
      hsl1.l = Math.max(hsl1.l - 0.3, 0);
    }
  }

  // Convert the adjusted HSL back to hex
  return hslToHex(hsl1.h, hsl1.s, hsl1.l);
};

const hexToLuminance = (hex: string): number => {
  // Convert the hex value to RGB
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;

  // Calculate the luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance;
};

const getContrastRatio = (luminance1: number, luminance2: number): number => {
  const l1 = luminance1 > luminance2 ? luminance1 : luminance2;
  const l2 = luminance1 > luminance2 ? luminance2 : luminance1;
  return (l1 + 0.05) / (l2 + 0.05);
};

const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  // Remove the leading '#' if present
  hex = hex.replace("#", "");

  // Convert the hex value to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find the maximum and minimum RGB values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // Calculate the lightness
  let l = (max + min) / 2;

  // Calculate the saturation
  let s = 0;
  if (max !== min) {
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  }

  // Calculate the hue
  let h = 0;
  if (max !== min) {
    if (max === r) {
      h = (g - b) / (max - min);
    } else if (max === g) {
      h = 2 + (b - r) / (max - min);
    } else if (max === b) {
      h = 4 + (r - g) / (max - min);
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  return { h: h / 360, s, l };
};
const hslToHex = (h: number, s: number, l: number): string => {
  let r, g, b;

  if (s === 0) {
    // Achromatic (grayscale)
    r = g = b = l; // r, g, b values are identical
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return "#" + toHex(r) + toHex(g) + toHex(b);
};

const getLightenedColor = (hex: string): string => {
  const hsl = hexToHsl(hex);
  hsl.l = Math.min(hsl.l + 0.3, 1);
  return hslToHex(hsl.h, hsl.s, hsl.l);
};
