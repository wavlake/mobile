import { checkIPRegion } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "./useUser";

// checks request IP against region block list
export const useRegionCheck = ({ enabled = true }) => {
  const { user } = useUser();
  return useQuery(
    ["regionCheck", user?.uid],
    // this will only return if the request is status 200
    // api returns 200 for success and 403 for rejection
    // any other status code will be treated as a rejection
    async () => checkIPRegion().catch(() => false),
    {
      retry: false,
      enabled: enabled,
    },
  );
};
