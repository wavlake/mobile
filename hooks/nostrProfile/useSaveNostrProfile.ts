import {
  makeProfileEvent,
  signEvent,
  publishEvent,
  cacheNostrProfileEvent,
} from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrProfile } from "./useNostrProfile";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";
import { NostrUserProfile } from "@/utils/types";

export const useSaveNostrProfile = () => {
  const { data: profile } = useNostrProfile();
  const { writeRelayList } = useNostrRelayList();
  const nostrProfileQueryKey = useNostrProfileQueryKey(
    profile?.publicHex ?? "",
  );
  const queryClient = useQueryClient();
  const nostrProfileMutation = useMutation({
    mutationFn: async (newNostrProfileEvent: Event) => {
      await publishEvent(writeRelayList, newNostrProfileEvent);
      return newNostrProfileEvent;
    },
  });
  const save = async (newProfile: NostrUserProfile) => {
    const event = await signEvent(
      makeProfileEvent({ ...profile, ...newProfile }),
    );
    return new Promise<void>((resolve, reject) => {
      if (event) {
        nostrProfileMutation.mutate(event, {
          onSuccess: async (event) => {
            queryClient.setQueryData(nostrProfileQueryKey, event);
            await cacheNostrProfileEvent(event.pubkey, event);
            resolve();
          },
          onError: (error) => {
            console.error(error);
            reject(error);
          },
        });
      }
    });
  };

  return { save, isSaving: nostrProfileMutation.isPending };
};
