import { useAuth } from "@/hooks/useAuth";

export const useNostrRelayListQueryKey = (pubkey: string) => {
  return ["nostrRelayListEvent", pubkey];
};
