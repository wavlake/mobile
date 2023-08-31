import { Pressable } from "react-native";
import { ChevronDownIcon } from "react-native-heroicons/solid";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";

export const ModalCloseButton = () => {
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
      <ChevronDownIcon fill={colors.text} />
    </Pressable>
  );
};
