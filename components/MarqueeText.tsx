import { TextStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import TextTicker, { TextTickerProps } from "react-native-text-ticker";

interface MarqueeTextProps extends TextTickerProps {
  bold?: boolean;
  style?: TextStyle;
}

function easeInSine(x: number): number {
  return 1 - Math.cos((x * Math.PI) / 2);
}

export const MarqueeText = ({ bold, style, ...rest }: MarqueeTextProps) => {
  const { colors } = useTheme();

  return (
    <TextTicker
      scrollSpeed={20}
      marqueeDelay={1000}
      animationType="scroll"
      easing={easeInSine}
      {...rest}
      style={{
        color: colors.text,
        fontFamily: bold ? "Poppins_700Bold" : "Poppins_400Regular",
        ...style,
      }}
    />
  );
};
