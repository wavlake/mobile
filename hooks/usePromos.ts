import { useQuery } from "@tanstack/react-query";
import { getUserPromos } from "@/utils";
import { useUser } from "@/components";

export const usePromos = () => {
  const { user, initializingAuth } = useUser();

  return useQuery({
    queryKey: ["promos", !!user],
    queryFn: getUserPromos,
    enabled: !initializingAuth,
  });
};
