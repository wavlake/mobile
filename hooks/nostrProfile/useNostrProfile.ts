import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  NostrUserProfile,
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
    return JSON.parse(mostRecentProfileEvent.content) as NostrUserProfile;
  } catch {
    return null;
  }
};

// TODO - swap to using the npub cloud run service
// need to update the cloud run service to return the profile metadata
export const useLookupNostrProfile2 = (pubkey?: string | null) => {
  const [profileEvent, setProfileEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const { readRelayList } = useNostrRelayList();

  useEffect(() => {
    if (pubkey) {
      // setLoading(true);
      // getProfileMetadata(pubkey, readRelayList)
      //   .then((event) => {
      //     setProfileEvent(event);
      //     console.log("event", event);
      //     setLoading(false);
      //   })
      //   .catch(() => {
      //     setProfileEvent(null);
      //     setLoading(false);
      //   });
      setProfileEvent({
        content:
          '{"displayName":"JoshR","damus_donation_v2":0,"nip05":"josh@wavlake.com","lud16":"joshr4@strike.me","username":"josh_remaley","picture":"https://pfp.nostr.build/7c33a97b689f8a9db306c3cea22bcc53cd86c9a2ace76955cdfcd2f0b25346c6.png","nip05valid":true,"about":"dev @ wavlake","name":"JoshR","display_name":"JoshR","pubkey":"93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535","npub":"npub1j0shgumvguvlsp38s49v4zm8algtt92cerkwyeagan9m6tnu256s2eg9a7","created_at":1707773292,"banner":"https://m.primal.net/IIxP.png"}',
        created_at: 1716239572,
        id: "765bd71e615fc7c7b500640931536c7932bf0c01c51d5c3eac49ee7e1338461d",
        kind: 0,
        pubkey:
          "93e174736c4719f80627854aca8b67efd0b59558c8ece267a8eccbbd2e7c5535",
        sig: "619498f508b3b343ddd01343a733311052f1b509bd77734290c99ccddd14ff27a905beb83b0703e2200bffc24581057dab934f47440f572a5931af74a66e7605",
        tags: [],
      });
    } else {
      setProfileEvent(null);
      setLoading(false);
    }
  }, [pubkey]);

  if (!profileEvent?.content) {
    return { profileEvent: null, loading };
  }
  try {
    return {
      profileEvent: JSON.parse(profileEvent.content) as NostrUserProfile,
      loading,
    };
  } catch {
    return { profileEvent: null, loading };
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
