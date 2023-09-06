import { useQuery } from "@tanstack/react-query";
import { getCachedNostrProfile, getProfileMetadata } from "@/utils";

const useFreshNostrProfile = (pubkey: string | null) => {
  const { data } = useQuery({
    queryKey: ["freshNostrProfile", pubkey],
    queryFn: () => getProfileMetadata(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  return data;
};

const useCachedNostrProfile = (pubkey: string | null) => {
  const { data } = useQuery({
    queryKey: ["cachedNostrProfile", pubkey],
    queryFn: () => getCachedNostrProfile(pubkey ?? ""),
    enabled: Boolean(pubkey),
  });

  return data;
};

export const useNostrProfile = (pubkey: string | null) => {
  const freshNostrProfile = useFreshNostrProfile(pubkey);
  const cachedNostrProfile = useCachedNostrProfile(pubkey);
  const profile = freshNostrProfile ?? cachedNostrProfile;

  if (!profile) {
    return null;
  }

  return {
    avatarUrl: profile.picture,
    username: profile.display_name || profile.name,
  };
};
