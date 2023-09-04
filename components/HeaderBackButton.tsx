import { Pressable } from "react-native";
import { ChevronDownIcon } from "react-native-heroicons/solid";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface HeaderTitleProps {
  direction?: "left" | "down";
}

export const HeaderBackButton = ({ direction = "left" }: HeaderTitleProps) => {
  const { colors } = useTheme();
  const router = useRouter();
  const isPresented = router.canGoBack();
  const handlePress = () => {
    if (isPresented) {
      router.back();
    } else {
      router.push("../");
    }
  };

  return (
    <Pressable onPress={handlePress}>
      {direction === "left" && (
        <Icon name="chevron-left" size={40} color={colors.text} />
      )}
      {direction === "down" && <ChevronDownIcon fill={colors.text} />}
    </Pressable>
  );
};
