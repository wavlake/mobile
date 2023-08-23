import {
  Text as BaseText,
  TextProps as BaseTextProps,
  TextStyle,
} from "react-native";
import { useTheme } from "@react-navigation/native";

interface TextProps extends BaseTextProps {
  bold?: boolean;
  style?: TextStyle;
}

export const Text = ({ bold, style, ...rest }: TextProps) => {
  const { colors } = useTheme();

  return (
    <BaseText
      {...rest}
      style={{
        color: colors.text,
        fontFamily: bold ? "Poppins_700Bold" : "Poppins_400Regular",
        ...style,
      }}
    />
  );
};
