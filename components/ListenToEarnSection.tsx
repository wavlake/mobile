import { Text } from "./Text";
import { TouchableOpacity, View } from "react-native";
import { brandColors } from "@/constants";
import { usePromos } from "@/hooks";
import { useUser } from "./UserContextProvider";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export const ListenToEarnSection = () => {
  const { user, initializingAuth } = useUser();
  const { data: promos = [] } = usePromos();
  const router = useRouter();
  const onPress = () =>
    router.push({
      pathname: "/earn",
    });
  console.log("promos", promos);
  // this feature is hidden for users who are not logged in
  if ((!initializingAuth && !user) || !promos.length) {
    return null;
  }

  // if (!promos.length) {
  //   return null;
  // }

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          backgroundColor: brandColors.purple.DEFAULT,
          borderRadius: 10,
          height: 120,
          flexDirection: "row",
          gap: 10,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "black",
            alignSelf: "center",
            marginBottom: 20,
            fontSize: 24,
            transform: [{ rotate: "-15deg" }],
          }}
          bold
        >
          Listen to Earn
        </Text>
        <Image
          style={{
            width: 120,
            height: 120,
          }}
          source={require("@/assets/megaphone.png")}
        />
      </View>
    </TouchableOpacity>
  );
};
