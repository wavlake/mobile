import { catalogApiClient, ResponseObject, TrackResponse } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";

export const useAccountTracks = () => {
  const { user } = useUser();
  return useQuery({
    queryKey: ["accountTracks", user?.uid],
    queryFn: async () => {
      const { data } =
        await catalogApiClient.get<ResponseObject<TrackResponse[]>>(
          `/tracks/account`,
        );

      return data.data;
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });
};
