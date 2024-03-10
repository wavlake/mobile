import { Dimensions, View } from "react-native";
import { Dialog } from "@rneui/themed";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";
import { Button, Text } from "@/components";
import { useEffect } from "react";

const SHOW_SUCCESS_DURATION = 4000;

export const SuccessDialog = ({
  text,
  setIsOpen,
}: {
  text: string;
  setIsOpen: (value: boolean) => void;
}) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(false);
    }, SHOW_SUCCESS_DURATION);
  }, []);

  return (
    <Dialog
      isVisible={true}
      onBackdropPress={() => setIsOpen(false)}
      overlayStyle={{
        backgroundColor: colors.background,
        width: screenWidth - 32,
        paddingVertical: 32,
      }}
      backdropStyle={{
        backgroundColor: brandColors.black.light,
        opacity: 0.8,
      }}
    >
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
          numberOfLines={1}
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
    </Dialog>
  );
};
