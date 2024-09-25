import { useQuery } from "@tanstack/react-query";
import { getUserPromos } from "@/utils";
import { useUser } from "@/components";

export const usePromos = () => {
  const { user, catalogUser, initializingAuth } = useUser();
  const enabled =
    !initializingAuth &&
    catalogUser?.isRegionVerified &&
    !catalogUser?.isLocked;

  return useQuery({
    queryKey: ["promos", !!user],
    queryFn: getUserPromos,
    enabled,
  });
};
