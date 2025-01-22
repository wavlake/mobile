import { useQuery } from "@tanstack/react-query";
import {
  getCachedNostrRelayListEvent,
  getMostRecentEvent,
  getRelayListMetadata,
  getReadRelayUris,
  getWriteRelayUris,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_READ_RELAY_URIS,
  DEFAULT_WRITE_RELAY_URIS,
} from "@/utils/shared";

export const getNostrRelayListQueryKey = (pubkey: string) => {
  return ["nostrRelayListEvent", pubkey];
};

const useNostrRelayListEvent = (pubkey: string) => {
  const queryKey = getNostrRelayListQueryKey(pubkey);
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

export const useNostrRelayList = (pubkeyOverride?: string | null) => {
  const { pubkey: loggedInPubkey } = useAuth();
  const pubkey = pubkeyOverride ?? loggedInPubkey;
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
