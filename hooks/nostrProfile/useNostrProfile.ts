import { useQuery } from "@tanstack/react-query";
import {
  encodeNpub,
  getCachedNostrProfileEvent,
  getMostRecentEvent,
  getProfileMetadata,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";
import { useMemo } from "react";
import { NostrUserProfile } from "@/utils/types";

export const useNostrProfileEvent = (
  pubkey?: string | null,
  // when a new user is logged in, the readRelayList is updated, which causes this query to refetch
  shouldUpdateOnRelayListChange: boolean = true,
) => {
  const { pubkey: loggedInPubkey } = useAuth();
  const finalPubkey = pubkey ?? loggedInPubkey;
  const { readRelayList } = useNostrRelayList();

  const memoizedReadRelayList = useMemo(() => {
    return shouldUpdateOnRelayListChange
      ? readRelayList
      : readRelayList.slice(0);
  }, [shouldUpdateOnRelayListChange, readRelayList]);

  const queryKey = useNostrProfileQueryKey(pubkey ?? "");

  return useQuery({
    queryKey,
    queryFn: async () => {
      const isValid =
        finalPubkey && finalPubkey.length === 64 && !!encodeNpub(finalPubkey);

      if (!isValid) {
        return null;
      }

      const event = await getProfileMetadata(
        finalPubkey,
        memoizedReadRelayList,
      );
      if (!event) {
        return null;
      }

      try {
        return JSON.parse(event.content) as NostrUserProfile;
      } catch {
        return null;
      }
    },
    enabled: Boolean(finalPubkey),
    staleTime: Infinity,
  });
};

const useCachedNostrProfileEvent = (pubkey: string) => {
  return useQuery({
    queryKey: ["cachedNostrProfileEvent", pubkey],
    queryFn: () => getCachedNostrProfileEvent(pubkey),
    enabled: Boolean(pubkey),
  });
};

export const useNostrProfile = (pubkey?: string) => {
  const { pubkey: loggedInPubkey } = useAuth();
  // if no pubkey is provided, use the logged in user's pubkey
  const { data: nostrProfileEvent } = useNostrProfileEvent(
    pubkey ?? loggedInPubkey,
  );
  const { data: cachedNostrProfileEvent } = useCachedNostrProfileEvent(
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
