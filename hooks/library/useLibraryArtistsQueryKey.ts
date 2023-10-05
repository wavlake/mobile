import { useAuth } from "@/hooks/useAuth";

export const useLibraryArtistsQueryKey = () => {
  const { pubkey } = useAuth();

  return ["libraryArtists", pubkey];
};
