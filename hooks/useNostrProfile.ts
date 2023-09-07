import { useQuery } from "@tanstack/react-query";
import {
  getCachedNostrProfileEvent,
  getMostRecentEvent,
  getProfileMetadata,
} from "@/utils";
import { useAuth } from "@/hooks/useAuth";

const useNostrProfileEvent = (pubkey: string | null) => {
  const { data } = useQuery({
    queryKey: ["nostrProfileEvent", pubkey],
    queryFn: () => getProfileMetadata(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  return data;
};

const useCachedNostrProfileEvent = (pubkey: string | null) => {
  const { data } = useQuery({
    queryKey: ["cachedNostrProfileEvent", pubkey],
    queryFn: () => getCachedNostrProfileEvent(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  return data;
};

export const useNostrProfile = () => {
  const { pubkey } = useAuth();
  const nostrProfileEvent = useNostrProfileEvent(pubkey);
  const cachedNostrProfileEvent = useCachedNostrProfileEvent(pubkey);
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
    const profile = JSON.parse(mostRecentProfileEvent.content);

    return {
      avatarUrl: profile.picture,
      username: profile.display_name || profile.name,
    };
  } catch {
    return null;
  }
};
