import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNostrRelayList } from "../nostrRelayList";
import { useAuth } from "../useAuth";
import { Contacts, getKind3Event, publishEvent, signEvent } from "@/utils";
import { EventTemplate } from "nostr-tools";
import { useToast } from "../useToast";
import { nostrQueryKeys } from "@/providers";

const followerTag = "p";

export const useAddFollow = () => {
  const toast = useToast();
  const { pubkey: loggedInPubkey } = useAuth();
  const { readRelayList, writeRelayList } = useNostrRelayList();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pubkey?: string) => {
      const queryKey = nostrQueryKeys.follows(loggedInPubkey);
      queryClient.invalidateQueries({ queryKey });

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

      const newFollowers = [
        ...existingFollowersPubkeys,
        ...(pubkey ? [pubkey] : []),
      ];

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
      if (!signed) {
        toast.show("Failed to sign event");
        return;
      }

      await publishEvent(writeRelayList, signed);
      queryClient.setQueryData(queryKey, (data: string[]) => {
        return newFollowers;
      });
    },
  });
};
