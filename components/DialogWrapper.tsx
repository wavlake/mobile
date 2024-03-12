import { Dialog } from "@rneui/themed";
import { brandColors } from "@/constants";
import { Dimensions } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PropsWithChildren } from "react";

interface DialogWrapperProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const DialogWrapper = ({
  isOpen,
  setIsOpen,
  children,
}: PropsWithChildren<DialogWrapperProps>) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;

  return (
    <Dialog
      isVisible={isOpen}
      onBackdropPress={() => setIsOpen(false)}
      overlayStyle={{
        backgroundColor: colors.background,
        width: screenWidth - 32,
        paddingVertical: 20,
      }}
      backdropStyle={{
        backgroundColor: brandColors.black.light,
        opacity: 0.3,
      }}
    >
      {children}
    </Dialog>
  );
};
