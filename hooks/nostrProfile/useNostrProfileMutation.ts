import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useNostrPublishRelayList } from "@/hooks/useNostrPublishRelayList";
import { publishEvent, cacheNostrProfileEvent } from "@/utils";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";

const noop = () => {};

interface UseNostrProfileMutationParams {
  onSuccess?: () => void;
  onError?: () => void;
  onSettled?: () => void;
}

export const useNostrProfileMutation = ({
  onSuccess = noop,
  onError = noop,
  onSettled = noop,
}: UseNostrProfileMutationParams) => {
  const nostrProfileQueryKey = useNostrProfileQueryKey();
  const queryClient = useQueryClient();
  const userPublishRelays = useNostrPublishRelayList();
  const defaultPublishProfileRelays = [
    "wss://purplepag.es",
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
    "wss://relay.wavlake.com",
    "wss://nostr.mutinywallet.com",
  ];
  const relays =
    userPublishRelays.length > 0
      ? userPublishRelays
      : defaultPublishProfileRelays;

  return useMutation({
    mutationFn: async (newNostrProfileEvent: Event) => {
      await publishEvent(relays, newNostrProfileEvent);

      return newNostrProfileEvent;
    },
    onSuccess: (event) => {
      onSuccess();
      queryClient.setQueryData(nostrProfileQueryKey, event);

      return cacheNostrProfileEvent(event.pubkey, event);
    },
    onError: (error) => {
      onError();
      console.error(error);
    },
    onSettled: () => {
      onSettled();
    },
  });
};
