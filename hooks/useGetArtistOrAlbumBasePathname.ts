import { usePathname } from "expo-router";

export const useGetArtistOrAlbumBasePathname = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/search")) {
    return "/search";
  }

  if (pathname.startsWith("/library")) {
    return "/library/music";
  }

  return "";
};
