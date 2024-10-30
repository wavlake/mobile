import { useQuery } from "@tanstack/react-query";
import { getHomePage, HomePageData } from "@/utils";
import { useUser } from "@/components";
import { useAuth } from "./useAuth";

export const useHomePage = () => {
  const { initializingAuth } = useUser();
  const { pubkey } = useAuth();

  return useQuery<HomePageData>({
    queryKey: ["homePage", pubkey],
    queryFn: () => getHomePage(pubkey),
    enabled: !initializingAuth,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};
