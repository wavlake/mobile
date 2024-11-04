import {
  Button as BaseButton,
  ButtonProps as BaseButtonProps,
} from "@rneui/themed";
import { brandColors } from "@/constants";
import { Text } from "./Text";
import { PropsWithChildren } from "react";
import { DimensionValue } from "react-native";

export interface ButtonProps extends BaseButtonProps {
  color?: string;
  width?: DimensionValue;
}

export const Button = ({
  children,
  color = brandColors.pink.DEFAULT,
  width = 200,
  titleStyle,
  ...rest
}: PropsWithChildren<ButtonProps>) => {
  return (
    <BaseButton
      size="lg"
      color={color}
      buttonStyle={{
        borderRadius: 8,
        width,
      }}
      disabledStyle={{ opacity: 0.5, backgroundColor: color }}
      {...rest}
      // this height is needed to match the height of the Text component
      loadingStyle={{
        height: 23,
      }}
      loadingProps={{
        color: color === "white" ? brandColors.black.DEFAULT : "white",
      }}
    >
      <Text
        style={[{ color: brandColors.black.DEFAULT, fontSize: 18 }, titleStyle]}
        bold
      >
        {children}
      </Text>
    </BaseButton>
  );
};
