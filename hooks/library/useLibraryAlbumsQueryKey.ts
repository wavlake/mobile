import { useAuth } from "@/hooks/useAuth";

export const useLibraryAlbumsQueryKey = () => {
  const { pubkey } = useAuth();

  return ["libraryAlbums", pubkey];
};
