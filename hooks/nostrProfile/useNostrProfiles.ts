import { useQueries } from "@tanstack/react-query";
import { encodeNpub, getProfileMetadata } from "@/utils";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";
import { useMemo } from "react";
import { NostrUserProfile } from "@/utils/types";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const useNostrProfiles = (
  profiles: {
    pubkey: string;
    relays: string[];
  }[],
) => {
  const { readRelayList } = useNostrRelayList();

  const results = useQueries({
    queries: profiles.map(({ pubkey, relays }) => ({
      queryKey: useNostrProfileQueryKey(pubkey),
      queryFn: async () => {
        const isValid = pubkey && pubkey.length === 64 && !!encodeNpub(pubkey);

        if (!isValid) {
          return null;
        }

        const event = await getProfileMetadata(pubkey, relays ?? readRelayList);
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
      staleTime: TWENTY_FOUR_HOURS,
    })),
  });

  // Convert results into a Map for easier consumption
  const profilesMap = useMemo(() => {
    const map = new Map<string, NostrUserProfile>();
    results.forEach((result, index) => {
      if (result.data) {
        map.set(profiles[index].pubkey, result.data);
      }
    });
    return map;
  }, [results, profiles]);

  const isLoading = results.some((result) => result.isLoading);

  return {
    profiles: profilesMap,
    isLoading,
  };
};
