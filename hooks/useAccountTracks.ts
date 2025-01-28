import { catalogApiClient, ResponseObject, TrackResponse } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useAccountTracks = () => {
  return useQuery({
    queryKey: ["accountTracks"],
    queryFn: async () => {
      const { data } =
        await catalogApiClient.get<ResponseObject<TrackResponse[]>>(
          `/tracks/account`,
        );

      return data.data;
    },
  });
};
