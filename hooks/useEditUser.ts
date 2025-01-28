import { catalogApiClient, ResponseObject } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UserEditForm {
  name: string;
  ampSat: string;
  artwork?: any;
  artworkUrl?: any;
  uid: string;
}

export const useEditUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      user: Partial<Omit<UserEditForm, "ampSat"> & { ampMsat: number }>,
    ) => {
      const formIsEmpty = !Object.values(user).some(
        (value) => value !== undefined && value !== null,
      );
      if (formIsEmpty) {
        return;
      }

      const requestFormData = new FormData();

      if (user.name) {
        requestFormData.append("name", user.name);
      }

      if (user.ampMsat) {
        requestFormData.append("ampMsat", user.ampMsat.toString());
      }

      if (user.artwork) {
        requestFormData.append("artwork", user.artwork as any);
      }

      const { data } = await catalogApiClient.put<
        ResponseObject<{ userId: string }>
      >("/accounts", requestFormData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data, // Prevent axios from trying to transform the FormData
      });

      return data.data;
    },
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
  });
};
