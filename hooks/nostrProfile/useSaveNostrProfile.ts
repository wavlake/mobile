import { makeProfileEvent, signEvent, publishEvent } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrProfile } from "./useNostrProfile";
import { NostrUserProfile } from "@/utils/types";
import { useAuth } from "@/hooks/useAuth";
import { nostrQueryKeys } from "@/providers";

// TODO - update to update the cache in useNostrProfle
export const useSaveNostrProfile = () => {
  const { pubkey } = useAuth();
  const { data: event, decodeProfileMetadata } = useNostrProfile(pubkey);
  const profile = decodeProfileMetadata(event);
  const { writeRelayList } = useNostrRelayList();
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
            const nostrProfileQueryKey = nostrQueryKeys.profile(event.pubkey);
            queryClient.setQueryData(nostrProfileQueryKey, event);
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
