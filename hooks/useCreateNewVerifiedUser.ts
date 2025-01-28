import { catalogApiClient, ResponseObject } from "@/utils";
import { useMutation } from "@tanstack/react-query";

// this API endpoint is gaurded by an IP region check
export const useCreateNewVerifiedUser = () => {
  return useMutation({
    mutationFn: async (body: {
      username?: string;
      firstName?: string;
      lastName?: string;
      pubkey: string;
    }) => {
      const { data } = await catalogApiClient.post<
        ResponseObject<{
          username: string;
          profileUrl: string;
          pubkey: string;
          loginToken: string;
        }>
      >(`/accounts/user/verified`, body);

      return data.data;
    },
  });
};
