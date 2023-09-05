import {
  TextInput as BaseTextInput,
  TextInputProps as BaseTextInputProps,
  View,
} from "react-native";
import { Text } from "./Text";

interface TextInputProps extends BaseTextInputProps {
  label?: string;
  errorMessage?: string;
}

export const TextInput = ({
  label,
  errorMessage,
  style,
  ...rest
}: TextInputProps) => {
  return (
    <>
      {label && <Text style={{ marginBottom: 4 }}>{label}</Text>}
      <View style={{ height: 68 }}>
        <BaseTextInput
          {...rest}
          style={[
            {
              backgroundColor: "white",
              height: 48,
              padding: 10,
              borderRadius: 8,
            },
            style,
          ]}
        />
        {errorMessage && (
          <Text style={{ color: "red", marginTop: 4 }}>{errorMessage}</Text>
        )}
      </View>
    </>
  );
};
