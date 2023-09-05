import { Button as BaseButton } from "@rneui/themed";
import { brandColors } from "@/constants";
import { Text } from "@/components/Text";
import { PropsWithChildren } from "react";
import { TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  color?: string;
  fullWidth?: boolean;
}

export const Button = ({
  children,
  color = brandColors.pink.DEFAULT,
  fullWidth = false,
  ...rest
}: PropsWithChildren<ButtonProps>) => {
  return (
    <BaseButton
      size="lg"
      color={color}
      buttonStyle={{
        borderRadius: 8,
        width: fullWidth ? "100%" : 200,
      }}
      {...rest}
    >
      <Text style={{ color: brandColors.black.DEFAULT, fontSize: 18 }} bold>
        {children}
      </Text>
    </BaseButton>
  );
};
