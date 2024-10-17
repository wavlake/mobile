import { TouchableOpacity, View } from "react-native";
import { brandColors } from "@/constants";
import { usePromos } from "@/hooks";
import { useUser } from "./UserContextProvider";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

const IMAGE_HEIGHT = 143;
export const TopUpSection = () => {
  const { user, initializingAuth } = useUser();
  const { data: promos = [] } = usePromos();
  const router = useRouter();
  const onPress = () =>
    router.push({
      pathname: "/topup",
    });

  // this feature is hidden for users who are not logged in
  if ((!initializingAuth && !user) || !promos.length) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          backgroundColor: brandColors.purple.DEFAULT,
          borderRadius: 10,
          height: IMAGE_HEIGHT,
          flexDirection: "row",
          gap: 10,
          justifyContent: "center",
        }}
      >
        <Image
          style={{
            width: "100%",
            height: IMAGE_HEIGHT,
          }}
          source={require("@/assets/TOPUPMUSIC5.png")}
        />
      </View>
    </TouchableOpacity>
  );
};
