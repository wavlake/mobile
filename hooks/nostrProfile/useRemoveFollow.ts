import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNostrRelayList } from "../nostrRelayList";
import { useAuth } from "../useAuth";
import { Contacts, getKind3Event, publishEvent, signEvent } from "@/utils";
import { useToast } from "../useToast";
import { nostrQueryKeys } from "@/providers";

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
        toast.show("Failed to unfollow user");
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
      if (!signed) {
        toast.show("Failed to sign event");
        return;
      }
      const queryKey = nostrQueryKeys.follows(loggedInPubkey);
      await publishEvent(writeRelayList, signed);
      queryClient.setQueryData(queryKey, (data: string[]) => {
        return newFollows.map((follow) => follow[1]);
      });
    },
  });
};
