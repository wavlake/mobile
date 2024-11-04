import { Link } from "expo-router";
import { DialogWrapper } from "./DialogWrapper";
import { Text } from "./shared/Text";
import { View } from "react-native";

export const WelcomeDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  return (
    <DialogWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
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
        <Link href="/earn" onPress={() => setIsOpen(false)}>
          <Text
            bold
            style={{
              textDecorationLine: "underline",
            }}
          >
            Start earning now
          </Text>
        </Link>
      </View>
    </DialogWrapper>
  );
};
