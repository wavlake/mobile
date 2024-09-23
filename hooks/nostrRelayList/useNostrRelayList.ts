import { useQuery } from "@tanstack/react-query";
import {
  getCachedNostrRelayListEvent,
  getMostRecentEvent,
  getRelayListMetadata,
  getReadRelayUris,
  getWriteRelayUris,
  DEFAULT_READ_RELAY_URIS,
  DEFAULT_WRITE_RELAY_URIS,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNostrRelayListQueryKey } from "./useNostrRelayListQueryKey";

const useNostrRelayListEvent = (pubkey: string) => {
  const queryKey = useNostrRelayListQueryKey();
  const { data } = useQuery({
    queryKey,
    queryFn: () => getRelayListMetadata(pubkey),
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });

  return data;
};

const useCachedNostrRelayListEvent = (pubkey: string) => {
  const { data } = useQuery({
    queryKey: ["cachedNostrRelayListEvent", pubkey],
    queryFn: () => getCachedNostrRelayListEvent(pubkey),
    enabled: Boolean(pubkey),
    staleTime: Infinity,
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
  const readRelayList = mostRecentRelayListEvent
    ? getReadRelayUris(mostRecentRelayListEvent)
    : DEFAULT_READ_RELAY_URIS;
  const writeRelayList = mostRecentRelayListEvent
    ? getWriteRelayUris(mostRecentRelayListEvent)
    : DEFAULT_WRITE_RELAY_URIS;

  return {
    readRelayList,
    writeRelayList,
  };
};
