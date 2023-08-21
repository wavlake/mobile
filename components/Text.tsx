import { Text as BaseText, TextProps } from "react-native";
import { useTheme } from "@react-navigation/native";

export const Text = (props: TextProps) => {
  const { colors } = useTheme();

  return (
    <BaseText
      style={{ color: colors.text, fontFamily: "Poppins_400Regular" }}
      {...props}
    />
  );
};
