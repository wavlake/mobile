import {
  Button as BaseButton,
  ButtonProps as BaseButtonProps,
} from "@rneui/themed";
import { brandColors } from "@/constants";
import { Text } from "@/components/Text";
import { PropsWithChildren } from "react";
import { DimensionValue } from "react-native";
import { ActivityIndicator } from "react-native";

export interface SlimButtonProps extends BaseButtonProps {
  color?: string;
  width?: DimensionValue;
}

export const SlimButton = ({
  children,
  color = brandColors.pink.DEFAULT,
  width = 200,
  titleStyle,
  ...rest
}: PropsWithChildren<SlimButtonProps>) => {
  return (
    <BaseButton
      size="sm"
      color={color}
      buttonStyle={{
        borderRadius: 20,
        width,
      }}
      disabledStyle={{ opacity: 0.5, backgroundColor: color }}
      {...rest}
      // this height is needed to match the height of the Text component
      loadingStyle={{ height: 23 }}
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
