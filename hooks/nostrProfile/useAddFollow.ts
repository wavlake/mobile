import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNostrRelayList } from "../nostrRelayList";
import { useAuth } from "../useAuth";
import { getKind3Event, publishEvent, signEvent } from "@/utils";
import { EventTemplate } from "nostr-tools";
import { getNostrFollowsQueryKey } from "./useNostrFollows";

const Contacts = 3;
const followerTag = "p";

export const useAddFollow = () => {
  const { pubkey: loggedInPubkey } = useAuth();
  const { readRelayList, writeRelayList } = useNostrRelayList();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pubkey: string) => {
      let currentKind3Event: Event | EventTemplate | null = await getKind3Event(
        loggedInPubkey,
        readRelayList,
      );

      if (!currentKind3Event) {
        // if we cant find the user's event, we need to create one
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
      const queryKey = getNostrFollowsQueryKey(loggedInPubkey);
      queryClient.setQueryData(queryKey, (data: string[]) => {
        return newFollowers;
      });
    },
  });
};
