import { catalogApiClient, PrivateUserData, ResponseObject } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const usePrivateUserData = (enabled: boolean) => {
  return useQuery<PrivateUserData>({
    queryFn: async () => {
      const { data } = await catalogApiClient
        .get<ResponseObject<PrivateUserData>>(`/accounts`)
        .catch((error) => {
          console.log("usePrivateUserData error", error);
          throw error;
        });

      return data.data;
    },
    queryKey: ["userData"],
    enabled,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });
};
