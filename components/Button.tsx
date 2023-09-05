import {
  Button as BaseButton,
  ButtonProps as BaseButtonProps,
} from "@rneui/themed";
import { brandColors } from "@/constants";
import { Text } from "@/components/Text";
import { PropsWithChildren } from "react";

interface ButtonProps extends BaseButtonProps {
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
