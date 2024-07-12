import { useQuery } from "@tanstack/react-query";
import { useNostrRelayList } from "./nostrRelayList";

export const useRepliesQueryKey = (kind1EventId?: string | null) => {
  return ["replies", kind1EventId];
};

export const useReplies = (kind1EventId?: string | null) => {
  const { readRelayList } = useNostrRelayList();
  const queryKey = useRepliesQueryKey(kind1EventId);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!kind1EventId) return null;

      // const event = await getProfileMetadata(pubkey, readRelayList);
      // if (!event) return null;

      // try {
      //   return JSON.parse(event?.content) as NostrUserProfile;
      // } catch {
      //   return null;
      // }
    },
    enabled: Boolean(kind1EventId),
    staleTime: Infinity,
  });
};
