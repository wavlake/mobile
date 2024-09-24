import { useEffect, useState } from "react";
import { getColors, ImageColorsResult } from "react-native-image-colors";

export const useGetColorPalette = (url: string) => {
  const [colors, setColors] = useState<ImageColorsResult>();
  useEffect(() => {
    getColors(url, {
      fallback: "#000000",
      quality: "low",
      pixelSpacing: 5,
      cache: true,
      key: url,
    }).then((colors) => {
      setColors(colors);
    });
  }, [url]);

  return colors;
};
