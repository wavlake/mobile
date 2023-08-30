import { Pressable } from "react-native";
import { ChevronDownIcon } from "react-native-heroicons/solid";
import { useRouter } from "expo-router";

export const ModalCloseButton = () => {
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
      <ChevronDownIcon />
    </Pressable>
  );
};
