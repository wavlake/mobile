import { useQuery } from "@tanstack/react-query";
import {
  getCachedNostrRelayListEvent,
  getMostRecentEvent,
  getRelayListMetadata,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";

const useNostrRelayListEvent = (pubkey: string) => {
  const { data } = useQuery({
    queryKey: ["nostrRelayListEvent", pubkey],
    queryFn: () => getRelayListMetadata(pubkey),
    enabled: Boolean(pubkey),
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

export const useNostrPublishRelayList = () => {
  const { pubkey } = useAuth();
  const nostrRelayListEvent = useNostrRelayListEvent(pubkey);
  const cachedNostrRelayListEvent = useCachedNostrRelayListEvent(pubkey);
  const events = [];

  if (nostrRelayListEvent) {
    events.push(nostrRelayListEvent);
  }

  if (cachedNostrRelayListEvent) {
    events.push(cachedNostrRelayListEvent);
  }

  const mostRecentRelayListEvent = getMostRecentEvent(events);

  if (!mostRecentRelayListEvent) {
    return [];
  }

  try {
    return mostRecentRelayListEvent.tags
      .filter(
        (tag) => tag[0] === "r" && (tag[2] === "write" || tag[2] === undefined),
      )
      .map((tag) => tag[1]);
  } catch {
    return [];
  }
};
