import { ShowEvents } from "@/constants";
import { useNostrRelayList } from "@/hooks";
import { publishEvent, signEvent } from "@/utils";
import { Button, View } from "react-native";
import { v4 as uuidv4 } from "uuid";

export const PublishTix = () => {
  const { writeRelayList } = useNostrRelayList();
  const onPress = async () => {
    ShowEvents.forEach(async (event) => {
      //update the created_at timestamp to the current time
      const updatedEvent = {
        ...event,
        created_at: Math.floor(Date.now() / 1000),
        // update d tag values to a random uuid
        tags: [...event.tags, ["d", uuidv4()]],
      };
      const signedEvent = await signEvent(updatedEvent);
      if (signedEvent) {
        console.log(signedEvent.id);
        await publishEvent(writeRelayList, signedEvent);
      }
    });
  };
  return (
    <View>
      <Button title="publish" onPress={onPress} />
    </View>
  );
};
