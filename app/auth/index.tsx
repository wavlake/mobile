import { Center, Text, LogoIcon, Button } from "@/components";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { brandColors } from "@/constants";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <Center style={{ gap: 40 }}>
      <Text style={{ fontSize: 32 }} bold>
        Turn up the value.
      </Text>
      <View style={{ paddingVertical: 24 }}>
        <LogoIcon fill="white" width={130} height={108} />
      </View>
      <Button
        onPress={() => {
          router.push("/auth/login");
        }}
        color={brandColors.pink.DEFAULT}
      >
        Let's Go
      </Button>
    </Center>
  );
}
