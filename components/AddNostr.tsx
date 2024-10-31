import { Center, Text, Button } from "@/components";
import { View } from "react-native";
import { useRouter } from "expo-router";

export const AddNostr = () => {
  const router = useRouter();
  return (
    <Center>
      <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 18 }}>
          You must connect a nostr account to create a library.
        </Text>
      </View>
      <Button
        onPress={() => {
          router.push("/settings");
          router.push("/settings/advanced");
          router.push("/settings/nsec");
        }}
      >
        Add Nostr
      </Button>
    </Center>
  );
};
