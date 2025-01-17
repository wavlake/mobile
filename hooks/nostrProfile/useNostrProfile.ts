import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  batchGetProfileMetadata,
  encodeNpub,
  getFollowsList,
  getProfileMetadata,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";
import { useMemo } from "react";
import { NostrUserProfile } from "@/utils/types";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const useNostrProfile = (
  pubkey?: string | null,
  shouldUpdateOnRelayListChange: boolean = true,
) => {
  const { data: event } = useNostrProfileEvent(
    pubkey,
    shouldUpdateOnRelayListChange,
  );
  if (!event) {
    return null;
  }

  try {
    return JSON.parse(event.content) as NostrUserProfile;
  } catch {
    return null;
  }
};

export const useCacheFollows = (pubkey?: string) => {
  const queryClient = useQueryClient();
  const { data: followsMap } = useNostrFollows(pubkey);

  // Memoize the common relays Set creation
  const commonRelays = useMemo(() => {
    if (!followsMap) return new Set<string>();
    return new Set(Object.values(followsMap));
  }, [followsMap]);

  // Memoize follow pubkeys
  const followPubkeys = useMemo(() => {
    if (!followsMap) return [];
    return Object.keys(followsMap);
  }, [followsMap]);

  return useQuery({
    queryKey: ["cacheFollows", pubkey],
    queryFn: async () => {
      if (!followsMap) return;

      // Use the memoized values instead of creating new ones
      const events = await batchGetProfileMetadata(
        followPubkeys,
        Array.from(commonRelays),
      );

      // Batch update the cache
      events.forEach((event) => {
        queryClient.setQueryData(useNostrProfileQueryKey(event.pubkey), event);
      });

      // Return the events for potential use by components
      return events;
    },
    enabled: Boolean(followsMap),
    staleTime: TWENTY_FOUR_HOURS,
  });
};

export const useNostrFollows = (pubkey?: string | null) => {
  const { readRelayList } = useNostrRelayList();

  return useQuery({
    queryKey: ["follows", pubkey],
    queryFn: async () => {
      const isValid = pubkey && pubkey.length === 64 && !!encodeNpub(pubkey);

      if (!isValid) {
        return null;
      }

      return getFollowsList(pubkey, readRelayList);
    },
    enabled: Boolean(pubkey),
    staleTime: TWENTY_FOUR_HOURS,
  });
};

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

      return getProfileMetadata(finalPubkey, memoizedReadRelayList);
    },
    enabled: Boolean(finalPubkey),
    staleTime: TWENTY_FOUR_HOURS,
  });
};
