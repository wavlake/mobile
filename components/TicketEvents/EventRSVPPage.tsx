import { Text } from "@/components/Text";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { Button } from "../Button";

export const EventRSVPPage = () => {
  const router = useRouter();

  return (
    <View>
      <Text>Event RSVP Component</Text>
      <Button title="Back" onPress={() => router.back()}>
        Back
      </Button>
    </View>
  );
};
