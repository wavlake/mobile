import { getPubkeyMetadata } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useCatalogPubkeyQueryKey } from "./useCatalogPubkeyQueryKey";

export const useCatalogPubkey = (pubkey?: string | null) => {
  const queryKey = useCatalogPubkeyQueryKey(pubkey);
  return useQuery({
    queryKey,
    queryFn: () => getPubkeyMetadata(pubkey),
    enabled: Boolean(pubkey),
    staleTime: 10000,
  });
};
