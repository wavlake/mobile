import { useQuery } from "@tanstack/react-query";
import {
  NostrUserProfile,
  getCachedNostrProfileEvent,
  getMostRecentEvent,
  getProfileMetadata,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";

const useNostrProfileEvent = (pubkey: string) => {
  const { readRelayList } = useNostrRelayList();
  const queryKey = useNostrProfileQueryKey();
  const { data } = useQuery({
    queryKey,
    queryFn: () => getProfileMetadata(pubkey, readRelayList),
    enabled: Boolean(pubkey),
    staleTime: 10000,
  });

  return data;
};

const useCachedNostrProfileEvent = (pubkey: string) => {
  const { data } = useQuery({
    queryKey: ["cachedNostrProfileEvent", pubkey],
    queryFn: () => getCachedNostrProfileEvent(pubkey),
    enabled: Boolean(pubkey),
  });

  return data;
};

export const useNostrProfile = () => {
  const { pubkey } = useAuth();
  const nostrProfileEvent = useNostrProfileEvent(pubkey ?? "");
  const cachedNostrProfileEvent = useCachedNostrProfileEvent(pubkey ?? "");
  const events = [];

  if (nostrProfileEvent) {
    events.push(nostrProfileEvent);
  }

  if (cachedNostrProfileEvent) {
    events.push(cachedNostrProfileEvent);
  }

  const mostRecentProfileEvent = getMostRecentEvent(events);

  if (!mostRecentProfileEvent) {
    return null;
  }

  try {
    return JSON.parse(mostRecentProfileEvent.content) as NostrUserProfile;
  } catch {
    return null;
  }
};

export const useLookupNostrProfile = (pubkey?: string | null) => {
  const { readRelayList } = useNostrRelayList();

  return useQuery({
    queryKey: ["nostrProfileMetadata", pubkey],
    queryFn: async () => {
      if (!pubkey) return null;

      const event = await getProfileMetadata(pubkey, readRelayList);
      if (!event) return null;

      try {
        return JSON.parse(event?.content) as NostrUserProfile;
      } catch {
        return null;
      }
    },
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
