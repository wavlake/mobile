import { usePathname } from "expo-router";

export const useGetBasePathname = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/search")) {
    return "/search";
  }

  if (pathname.startsWith("/library")) {
    return "/library/music";
  }

  if (pathname.startsWith("/pulse")) {
    return "/pulse";
  }

  if (pathname.startsWith("/profile")) {
    return "/profile";
  }

  return "";
};
