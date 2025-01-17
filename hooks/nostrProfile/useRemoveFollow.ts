import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNostrRelayList } from "../nostrRelayList";
import { useAuth } from "../useAuth";
import { getKind3Event, publishEvent, signEvent } from "@/utils";
import { Contacts } from "nostr-tools/lib/types/kinds";
import { getNostrFollowsQueryKey } from "./useNostrFollows";
import { useToast } from "../useToast";

export const useRemoveFollow = () => {
  const { writeRelayList } = useNostrRelayList();
  const { readRelayList } = useNostrRelayList();
  const toast = useToast();
  const { pubkey: loggedInPubkey } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (removedFollowPubkey: string) => {
      const currentKind3Event = await getKind3Event(
        loggedInPubkey,
        readRelayList,
      );
      if (!currentKind3Event) {
        toast.show("Failed to remove follower");
        return;
      }

      const newFollows = currentKind3Event.tags.filter(
        (follow) => follow[1] !== removedFollowPubkey,
      );

      const event = {
        kind: Contacts,
        created_at: Math.round(new Date().getTime() / 1000),
        content: currentKind3Event?.content ?? "",
        tags: newFollows,
      };
      const signed = await signEvent(event);
      const queryKey = getNostrFollowsQueryKey(loggedInPubkey);
      queryClient.setQueryData(queryKey, (data: string[]) => {
        return newFollows;
      });
      await publishEvent(writeRelayList, signed);
    },
  });
};
