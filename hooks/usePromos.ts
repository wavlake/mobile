import { useQuery } from "@tanstack/react-query";
import { getUserPromos } from "@/utils";
import { useUser } from "@/components";

export const getUsePromoQueryKey = (uid?: string) => ["promos", uid];
export const usePromos = () => {
  const { user, catalogUser, initializingAuth } = useUser();
  const enabled = Boolean(
    !initializingAuth &&
      catalogUser?.isRegionVerified &&
      !catalogUser?.isLocked &&
      user,
  );

  const queryKey = getUsePromoQueryKey(user?.uid);

  return useQuery({
    queryKey,
    queryFn: getUserPromos,
    enabled,
  });
};
