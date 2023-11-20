import { useAuth } from "@/hooks/useAuth";

export const useBalanceQueryKey = () => {
  const { pubkey } = useAuth();

  return ["balance", pubkey];
};
