import { useMutation } from "@tanstack/react-query";
import { useNostrRelayList } from "../nostrRelayList";
import { useAuth } from "../useAuth";
import { getKind3Event, publishEvent, signEvent } from "@/utils";
import { Contacts } from "nostr-tools/lib/types/kinds";
import { EventTemplate } from "nostr-tools";

const followerTag = "p";

export const useAddFollower = () => {
  const { writeRelayList } = useNostrRelayList();
  const { pubkey: loggedInPubkey } = useAuth();

  return useMutation({
    mutationFn: async ({ pubkey }: { pubkey: string }) => {
      let currentKind3Event: Event | EventTemplate | null =
        await getKind3Event(loggedInPubkey);

      if (!currentKind3Event) {
        // need to take care here, if we cant find the user's event, we need to create one, but we might not now which relays to use
        currentKind3Event = {
          kind: Contacts,
          created_at: Math.round(new Date().getTime() / 1000),
          content: "",
          tags: [],
        };
      }
      const existingFollowersPubkeys = currentKind3Event.tags
        .filter((follow) => follow[0] === followerTag)
        .map((follow) => follow[1]);
      const otherTags = currentKind3Event.tags.filter(
        (tag) => tag[0] !== followerTag,
      );
      const newFollowers = Array.from(
        new Set([...existingFollowersPubkeys, pubkey]),
      );

      const event = {
        kind: Contacts,
        created_at: Math.round(new Date().getTime() / 1000),
        content: currentKind3Event.content,
        tags: [
          ...newFollowers.map((follower) => [followerTag, follower]),
          ...otherTags,
        ],
      };

      const signed = await signEvent(event);
      await publishEvent(writeRelayList, signed);
    },
  });
};
