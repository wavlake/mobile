import { catalogApiClient, ResponseObject } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export const useGetInboxLastRead = () => {
  const { pubkey } = useAuth();
  return useQuery({
    queryKey: ["inboxlastRead"],
    queryFn: async () => {
      const { data } = await catalogApiClient.get<ResponseObject<string>>(
        `/accounts/inbox/lastread`,
      );

      return data.data;
    },
    enabled: Boolean(pubkey),
    gcTime: 5 * 60 * 1000,
  });
};
