import { TouchableOpacity, View } from "react-native";
import { brandColors } from "@/constants";
import { usePromos, useUser } from "@/hooks";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { WelcomeDialog } from "./WelcomeDialog";

const IMAGE_HEIGHT = 143;
export const EarnSection = () => {
  const { user, initializingAuth } = useUser();
  const { data: promos = [] } = usePromos();
  const router = useRouter();
  const onPress = () =>
    router.push({
      pathname: "/earn",
    });

  // this feature is hidden for users who are not logged in
  if ((!initializingAuth && !user) || !promos.length) {
    return null;
  }

  return (
    <>
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
            source={require("@/assets/TOPUPMUSIC6.png")}
          />
        </View>
      </TouchableOpacity>
      <WelcomeDialog />
    </>
  );
};
