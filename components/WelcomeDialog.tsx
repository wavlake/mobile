import { Link } from "expo-router";
import { Text } from "./shared/Text";
import { Pressable } from "react-native";
import { PopupComponentProps } from "./PopupProvider";
import { brandColors } from "@/constants";

export const WelcomeDialog = ({ onClose }: PopupComponentProps) => {
  return (
    <Pressable
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: brandColors.black.DEFAULT,
        gap: 20,
        padding: 20,
      }}
      onPress={onClose}
    >
      <Text
        bold
        style={{
          fontSize: 18,
        }}
      >
        Listen to earn
      </Text>
      <Text>
        Get started by playing a promoted track to earn sats. Limit of earning
        once per track per day.
      </Text>
      <Link href="/earn" onPress={onClose}>
        <Text
          bold
          style={{
            textDecorationLine: "underline",
          }}
        >
          Start earning now
        </Text>
      </Link>
    </Pressable>
  );
};
