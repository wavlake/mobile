import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNostrRelayList } from "../nostrRelayList";
import { useAuth } from "../useAuth";
import { Contacts, getKind3Event, publishEvent, signEvent } from "@/utils";
import { EventTemplate } from "nostr-tools";
import { getNostrFollowsQueryKey } from "./useNostrFollows";

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

      const userAlreadyFollows = currentKind3Event.tags.some(
        (tag) => tag[1] === pubkey && tag[0] === followerTag,
      );
      if (userAlreadyFollows) {
        return;
      }

      const existingFollowersPubkeys: string[] = [];
      const otherTags: string[][] = [];

      currentKind3Event.tags.forEach((tag) => {
        if (tag[0] === followerTag) {
          existingFollowersPubkeys.push(tag[1]);
        } else {
          otherTags.push(tag);
        }
      });

      const newFollowers = [...existingFollowersPubkeys, pubkey];

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
