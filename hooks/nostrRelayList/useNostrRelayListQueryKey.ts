import { useAuth } from "@/hooks/useAuth";

export const useNostrRelayListQueryKey = () => {
  const { pubkey } = useAuth();

  return ["nostrRelayListEvent", pubkey];
};
