import { useQuery } from "@tanstack/react-query";
import { getHomePage, HomePageData } from "@/utils";
import { useUser } from "@/components";
import { useAuth } from "./useAuth";

export const useHomePage = () => {
  const { user } = useUser();
  const { pubkey } = useAuth();

  return useQuery<HomePageData>({
    queryKey: ["homePage", user, pubkey],
    queryFn: getHomePage,
  });
};
