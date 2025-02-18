import { useNostrProfile } from "./useNostrProfile";

export const useDecodedProfile = (pubkey?: string | null) => {
  const { data, refetch, isPending, decodeProfileMetadata } =
    useNostrProfile(pubkey);
  return {
    data: decodeProfileMetadata(data),
    isLoading: isPending,
    refetch,
  };
};
