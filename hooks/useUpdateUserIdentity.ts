import { saveUserIdentity } from "@/utils";
import { useMutation } from "@tanstack/react-query";

export const useUpdateUserIdentity = () => {
  return useMutation({
    mutationFn: saveUserIdentity,
  });
};
