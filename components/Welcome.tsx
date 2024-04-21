import { Button, Center, Text } from "@/components";
import { View } from "react-native";
import { useAuth } from "@/hooks";

export default function Welcome() {
  const { goToRoot } = useAuth();

  return (
    <Center>
      <View style={{ paddingHorizontal: 36, paddingBottom: 120 }}>
        <Text style={{ fontSize: 18 }}>Welcome</Text>
      </View>
      <Button onPress={goToRoot}>Edit Profile</Button>
      <Button onPress={goToRoot}>Start listening</Button>
    </Center>
  );
}
