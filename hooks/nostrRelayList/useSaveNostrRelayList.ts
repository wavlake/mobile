import {
  cacheNostrRelayListEvent,
  makeRelayListEvent,
  publishEvent,
  signEvent,
} from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useNostrRelayList } from "./useNostrRelayList";
import { useNostrRelayListQueryKey } from "./useNostrRelayListQueryKey";
export const useSaveNostrRelayList = () => {
  const nostrRelayListQueryKey = useNostrRelayListQueryKey();
  const queryClient = useQueryClient();
  const { writeRelayList } = useNostrRelayList();
  const nostrRelayListMutation = useMutation({
    mutationFn: async (newNostrRelayListEvent: Event) => {
      await publishEvent(writeRelayList, newNostrRelayListEvent);

      return newNostrRelayListEvent;
    },
  });
  const save = async (relayUris: string[]) => {
    const event = await signEvent(makeRelayListEvent(relayUris));

    return new Promise<void>((resolve, reject) => {
      if (event) {
        nostrRelayListMutation.mutate(event, {
          onSuccess: async () => {
            queryClient.setQueryData(nostrRelayListQueryKey, event);
            await cacheNostrRelayListEvent(event.pubkey, event);
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

  return { save, isSaving: nostrRelayListMutation.isLoading };
};
