import { useQuery } from "@tanstack/react-query";
import { getHomePageNoAuth, getHomePageAuth, HomePageData } from "@/utils";
import { useUser } from "@/components";

export const useHomePage = () => {
  const { user, initializingAuth } = useUser();

  return useQuery<HomePageData>({
    queryKey: ["homePage", !!user],
    queryFn: user ? getHomePageAuth : getHomePageNoAuth,
    enabled: !initializingAuth,
  });
};
