import { useQuery } from "@tanstack/react-query";
import {
  getCachedNostrRelayListEvent,
  getMostRecentEvent,
  getRelayListMetadata,
  getReadRelayUris,
  getWriteRelayUris,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNostrRelayListQueryKey } from "./useNostrRelayListQueryKey";

const useNostrRelayListEvent = (pubkey: string) => {
  const queryKey = useNostrRelayListQueryKey();
  const { data } = useQuery({
    queryKey,
    queryFn: () => getRelayListMetadata(pubkey),
    enabled: Boolean(pubkey),
    staleTime: 10000,
  });

  return data;
};

const useCachedNostrRelayListEvent = (pubkey: string) => {
  const { data } = useQuery({
    queryKey: ["cachedNostrRelayListEvent", pubkey],
    queryFn: () => getCachedNostrRelayListEvent(pubkey),
    enabled: Boolean(pubkey),
  });

  return data;
};

export const useNostrRelayList = () => {
  const { pubkey } = useAuth();
  const nostrRelayListEvent = useNostrRelayListEvent(pubkey ?? "");
  const cachedNostrRelayListEvent = useCachedNostrRelayListEvent(pubkey ?? "");
  const events = [];

  if (nostrRelayListEvent) {
    events.push(nostrRelayListEvent);
  }

  if (cachedNostrRelayListEvent) {
    events.push(cachedNostrRelayListEvent);
  }

  const mostRecentRelayListEvent = getMostRecentEvent(events);
  const defaultRelays = [
    "wss://purplepag.es",
    "wss://relay.nostr.band",
    "wss://relay.damus.io",
    "wss://relay.wavlake.com",
    "wss://nostr.mutinywallet.com",
  ];
  const readRelayList = mostRecentRelayListEvent
    ? getReadRelayUris(mostRecentRelayListEvent)
    : defaultRelays;
  const writeRelayList = mostRecentRelayListEvent
    ? getWriteRelayUris(mostRecentRelayListEvent)
    : defaultRelays;

  return {
    readRelayList,
    writeRelayList,
  };
};
