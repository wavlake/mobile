import { checkUsername } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useCheckIfUsernameExists = (
  username: string,
  // we manually trigger this query using refetch
  autoFetchQuery = false,
) => {
  return useQuery(
    [username],
    async () => {
      const usernameCheck = await checkUsername(username);
      // if a username is valid, that means it matches against an existing username
      return usernameCheck?.data?.some((check) => check.isValid);
    },
    {
      enabled: autoFetchQuery,
      retry: false,
    },
  );
};
