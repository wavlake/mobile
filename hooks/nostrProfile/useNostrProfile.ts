import { useQuery } from "@tanstack/react-query";
import { encodeNpub, getProfileMetadata } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";
import { useMemo } from "react";
import { NostrUserProfile } from "@/utils/types";
import { Event } from "nostr-tools";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const decodeProfileMetadata = (event: Event) => {
  try {
    return JSON.parse(event.content) as NostrUserProfile;
  } catch {
    return null;
  }
};

export const useNostrProfile = (
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

  const queryKey = useNostrProfileQueryKey(finalPubkey);

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

      return decodeProfileMetadata(event);
    },
    enabled: Boolean(finalPubkey),
    staleTime: TWENTY_FOUR_HOURS,
  });
};
