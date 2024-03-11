import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Button, Text } from "../";
import { useEffect } from "react";

const SHOW_SUCCESS_DURATION = 4000;

export const SuccessComponent = ({
  text,
  setIsOpen,
}: {
  text: string;
  setIsOpen: (value: boolean) => void;
}) => {
  const { colors } = useTheme();

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(false);
    }, SHOW_SUCCESS_DURATION);
  }, []);

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 5,
      }}
    >
      <Text
        style={{
          fontSize: 20,
          marginBottom: 20,
        }}
      >
        {text}
      </Text>
      <Button
        color={colors.border}
        titleStyle={{ color: colors.text }}
        onPress={() => setIsOpen(false)}
      >
        Close
      </Button>
    </View>
  );
};
