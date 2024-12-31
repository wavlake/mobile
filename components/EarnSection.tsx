import { TouchableOpacity, View } from "react-native";
import { brandColors } from "@/constants";
import { usePopup, usePromos, useUser } from "@/hooks";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const IMAGE_HEIGHT = 143;
export const EarnSection = () => {
  const { catalogUser, user, initializingAuth } = useUser();
  const { data: promos = [] } = usePromos();
  const router = useRouter();
  const { showWelcomePopup } = usePopup();
  const userNotEligible =
    !catalogUser?.isRegionVerified ||
    catalogUser?.isLocked ||
    !catalogUser?.emailVerified;

  useEffect(() => {
    if (catalogUser) {
      showWelcomePopup(catalogUser);
    }
  }, [catalogUser?.id]);

  const onPress = () =>
    router.push({
      pathname: "/earn",
    });

  if ((!initializingAuth && !user) || !promos.length || userNotEligible) {
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
          source={require("@/assets/TOPUPMUSIC6.png")}
        />
      </View>
    </TouchableOpacity>
  );
};
