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

export const useNostrProfileEvent = (pubkey?: string) => {
  const { readRelayList } = useNostrRelayList();
  const queryKey = useNostrProfileQueryKey(pubkey ?? "");
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!pubkey) {
        return null;
      }

      const event = await getProfileMetadata(pubkey, readRelayList);
      if (!event) {
        return null;
      }

      try {
        return JSON.parse(event.content) as NostrUserProfile;
      } catch {
        return null;
      }
    },
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};

const useCachedNostrProfileEvent = (pubkey: string) => {
  const { data } = useQuery({
    queryKey: ["cachedNostrProfileEvent", pubkey],
    queryFn: () => getCachedNostrProfileEvent(pubkey),
    enabled: Boolean(pubkey),
  });

  return data;
};

export const useNostrProfile = (pubkey?: string) => {
  const { pubkey: loggedInPubkey } = useAuth();
  // if no pubkey is provided, use the logged in user's pubkey
  const nostrProfileEvent = useNostrProfileEvent(pubkey ?? loggedInPubkey);
  const cachedNostrProfileEvent = useCachedNostrProfileEvent(
    pubkey ?? loggedInPubkey,
  );
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
