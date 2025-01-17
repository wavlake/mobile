import { useMutation } from "@tanstack/react-query";
import { useNostrRelayList } from "../nostrRelayList";
import { useAuth } from "../useAuth";
import { getKind3Event, publishEvent, signEvent } from "@/utils";
import { Contacts } from "nostr-tools/lib/types/kinds";

export const useRemoveFollower = () => {
  const { writeRelayList } = useNostrRelayList();
  const { pubkey: loggedInPubkey } = useAuth();

  return useMutation({
    mutationFn: async (removedFollowPubkey: string) => {
      const currentKind3Event = await getKind3Event(loggedInPubkey);
      if (!currentKind3Event) {
        return;
      }

      const event = {
        kind: Contacts,
        created_at: Math.round(new Date().getTime() / 1000),
        content: currentKind3Event?.content ?? "",
        tags: currentKind3Event.tags.filter(
          (follow) => follow[1] !== removedFollowPubkey,
        ),
      };
      const signed = await signEvent(event);
      await publishEvent(writeRelayList, signed);
    },
  });
};
