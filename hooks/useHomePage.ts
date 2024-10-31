import { useQuery } from "@tanstack/react-query";
import { getHomePage, HomePageData } from "@/utils";
import { useUser } from "./useUser";

export const useHomePage = () => {
  const { user, initializingAuth } = useUser();

  return useQuery<HomePageData>({
    queryKey: ["homePage", !!user],
    queryFn: getHomePage,
    enabled: !initializingAuth,
  });
};
