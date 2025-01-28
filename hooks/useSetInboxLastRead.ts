import { catalogApiClient, ResponseObject } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useSetInboxLastRead = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await catalogApiClient.put<ResponseObject<never>>(
        `/accounts/inbox/lastread`,
      );

      return data;
    },
  });
};
