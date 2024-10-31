import {
  TextInput as BaseTextInput,
  TextInputProps as BaseTextInputProps,
  View,
} from "react-native";
import { Text } from "./Text";
import { ReactNode } from "react";

interface TextInputProps extends BaseTextInputProps {
  label?: string;
  errorMessage?: string;
  rightIcon?: ReactNode;
  inputHeight?: number;
  includeErrorMessageSpace?: boolean;
}

export const TextInput = ({
  label,
  errorMessage,
  style,
  rightIcon,
  inputHeight = 48,
  includeErrorMessageSpace = true,
  ...rest
}: TextInputProps) => {
  return (
    <View style={{ width: "100%" }}>
      {label && (
        <Text style={{ marginBottom: 4 }} bold>
          {label}
        </Text>
      )}
      <View
        style={{
          height: includeErrorMessageSpace ? inputHeight + 20 : undefined,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <BaseTextInput
            {...rest}
            style={[
              {
                backgroundColor: "white",
                height: inputHeight,
                padding: 10,
                borderRadius: 8,
                flex: 1,
              },
              style,
            ]}
            placeholderTextColor="black"
          />
          {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
        </View>
        {errorMessage && (
          <Text style={{ color: "red", marginTop: 4 }}>{errorMessage}</Text>
        )}
      </View>
    </View>
  );
};
