import {
  catalogApiClient,
  deleteSecretFromKeychain,
  ResponseObject,
} from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser";
import { useAuth } from "./useAuth";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const { signOut } = useUser();
  return useMutation({
    mutationFn: async () => {
      const { data } =
        await catalogApiClient.put<ResponseObject<never>>("/accounts/disable");

      return data;
    },
    onSuccess(data) {
      // nostr logout
      logout();
      // firebase logout
      signOut();
      // delete user's nostr secret
      deleteSecretFromKeychain();
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
  });
};
