import { useAuth } from "@/hooks/useAuth";
import { useNostrRelayList } from "@/hooks/nostrRelayList";

export const useNostrProfileQueryKey = () => {
  const { pubkey } = useAuth();
  const { readRelayList } = useNostrRelayList();

  return ["nostrProfileEvent", pubkey, readRelayList];
};
