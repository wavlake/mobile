import { useAuth } from "@/hooks/useAuth";

export const useNostrProfileQueryKey = () => {
  const { pubkey } = useAuth();

  return ["nostrProfileEvent", pubkey];
};
