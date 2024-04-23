import { Text } from "@/components/Text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { Button } from "../Button";

export const EventDetailPage = () => {
  const { eventId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View>
      <Text>Event Details Component: {eventId ?? "no event id param"}</Text>
      <Button
        title="RSVP"
        onPress={() =>
          router.push({
            pathname: `/events/${eventId}/rsvp`,
            params: {
              includeBackButton: true,
            },
          })
        }
      >
        RSVP
      </Button>
    </View>
  );
};
