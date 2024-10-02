import { useQuery } from "@tanstack/react-query";
import { getUserPromos } from "@/utils";
import { useUser } from "@/components";

export const usePromos = () => {
  const { user, catalogUser, initializingAuth } = useUser();
  const enabled = Boolean(
    !initializingAuth &&
      catalogUser?.isRegionVerified &&
      !catalogUser?.isLocked,
  );

  console.log({ enabled });
  return useQuery({
    queryKey: ["promos", !!user],
    queryFn: getUserPromos,
    enabled,
  });
};
