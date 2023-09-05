import { Button, Center, Text } from "@/components";
import { Stack } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/hooks";

export default function Skip() {
  const { goToRoot } = useAuth();

  return (
    <>
      <Stack.Screen options={{ headerTitle: "Skip registration" }} />
      <Center>
        <View style={{ paddingHorizontal: 36, paddingBottom: 120 }}>
          <Text style={{ fontSize: 18 }}>
            We recommend you set up a profile to get the most out of the Wavlake
            app, but you can use Wavlake completely anonymously if you wish. You
            might miss out on some great features like artist exclusives and
            special access for fans, but you can always set up your profile
            later if you wish.
          </Text>
        </View>
        <Button onPress={goToRoot}>Just let me in</Button>
      </Center>
    </>
  );
}
