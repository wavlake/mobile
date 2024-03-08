import { Dimensions, View } from "react-native";
import { Dialog } from "@rneui/themed";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";
import { Button, Text } from "@/components";
import { useEffect, useState } from "react";

const SHOW_SUCCESS_DURATION = 3000;
export const IsSuccessDialog = () => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const [show, setShow] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShow(false);
    }, SHOW_SUCCESS_DURATION);
  }, []);

  return (
    <Dialog
      isVisible={show}
      onBackdropPress={() => setShow(false)}
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
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 18,
              paddingVertical: 12,
            }}
            numberOfLines={1}
            bold
          >
            Playlist created
          </Text>
          <Text
            style={{
              fontSize: 14,
              paddingVertical: 12,
            }}
            numberOfLines={1}
          >
            Your track has been added to the playlist
          </Text>
        </View>
        <Button
          color={colors.border}
          titleStyle={{ color: colors.text }}
          onPress={() => setShow(false)}
          width="100%"
        >
          Close
        </Button>
      </View>
    </Dialog>
  );
};
