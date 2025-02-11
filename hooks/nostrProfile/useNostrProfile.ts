import { useAuth } from "@/hooks/useAuth";
import { useNostrEvents } from "@/providers";
import { useQuery } from "@tanstack/react-query";

export const useNostrProfile = (pubkey?: string | null) => {
  const { getPubkeyProfile } = useNostrEvents();
  const { pubkey: loggedInPubkey } = useAuth();
  const finalPubkey = pubkey ?? loggedInPubkey;
  return useQuery({
    queryKey: ["profileMetadata", finalPubkey],
    queryFn: async () => {
      return getPubkeyProfile(finalPubkey);
    },
    enabled: Boolean(finalPubkey),
  });
};
