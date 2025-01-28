import { catalogApiClient, ResponseObject } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useCreateNewUser = () => {
  return useMutation({
    mutationFn: async (body: { username?: string; pubkey: string }) => {
      const { data } = await catalogApiClient.post<
        ResponseObject<{
          username: string;
          profileUrl: string;
          pubkey: string;
          loginToken: string;
        }>
      >(`/accounts/user`, body);

      return data.data;
    },
  });
};
