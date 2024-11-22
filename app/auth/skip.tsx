import { Button, Center, Text } from "@/components";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { setSkipLogin } from "@/utils";
import { ScrollView } from "react-native-gesture-handler";

export default function Skip() {
  const router = useRouter();
  const handleLoginAnonymously = async () => {
    await setSkipLogin();
    router.canDismiss() && router.dismissAll();
    router.replace("/");
  };

  return (
    <ScrollView>
      <Center>
        <View style={{ paddingHorizontal: 36, paddingBottom: 120 }}>
          <Text style={{ fontSize: 18 }}>
            We recommend you set up an account to get the most out of the
            Wavlake app, but you can use Wavlake completely anonymously if you
            wish. You will miss out on some great features like having your own
            custom library and special access for fans, but you can always set
            up your profile later if you wish.
          </Text>
        </View>
        <Button onPress={handleLoginAnonymously}>Just let me in</Button>
      </Center>
    </ScrollView>
  );
}
