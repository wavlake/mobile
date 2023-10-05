import { useAuth } from "@/hooks/useAuth";

export const useLibraryTracksQueryKey = () => {
  const { pubkey } = useAuth();

  return ["libraryTracks", pubkey];
};
