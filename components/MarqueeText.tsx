import { TextStyle } from "react-native";
import { useTheme } from "@react-navigation/native";
import TextTicker, { TextTickerProps } from "react-native-text-ticker";

interface MarqueeTextProps extends TextTickerProps {
  bold?: boolean;
  style?: TextStyle;
}

export const MarqueeText = ({ bold, style, ...rest }: MarqueeTextProps) => {
  const { colors } = useTheme();

  return (
    <TextTicker
      duration={5000}
      animationType="bounce"
      {...rest}
      style={{
        color: colors.text,
        fontFamily: bold ? "Poppins_700Bold" : "Poppins_400Regular",
        ...style,
      }}
    />
  );
};
