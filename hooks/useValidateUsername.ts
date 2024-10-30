import { validateUsername } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useValidateUsername = (username: string) => {
  return useQuery(
    ["validateUsername", username],
    () => validateUsername(username),
    {
      retry: false,
      enabled: false,
    },
  );
};
