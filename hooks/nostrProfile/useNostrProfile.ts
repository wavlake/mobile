import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCachedNostrProfileEvent,
  getMostRecentEvent,
  getProfileMetadata,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { Event } from "nostr-tools";

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
    return JSON.parse(mostRecentProfileEvent.content);
  } catch {
    return null;
  }
};

export const useLookupNostrProfile = (pubkey?: string | null) => {
  const [profileEvent, setProfileEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const { readRelayList } = useNostrRelayList();

  useEffect(() => {
    if (pubkey) {
      setLoading(true);
      getProfileMetadata(pubkey, readRelayList)
        .then((event) => {
          setProfileEvent(event);
          setLoading(false);
        })
        .catch(() => {
          setProfileEvent(null);
          setLoading(false);
        });
    } else {
      setProfileEvent(null);
      setLoading(false);
    }
  }, [pubkey, readRelayList]);

  if (!profileEvent?.content) {
    return { profileEvent: null, loading };
  }
  try {
    return { profileEvent: JSON.parse(profileEvent.content), loading };
  } catch {
    return { profileEvent: null, loading };
  }
};
