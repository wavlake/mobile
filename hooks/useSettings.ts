import { useAuth } from "./useAuth";
import { getSettings } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useSettingsQueryKey } from "./useSettingsQueryKey";
import { useUser } from "@/components";

export const useSettings = () => {
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const userId = catalogUser?.id ?? pubkey;
  const queryKey = useSettingsQueryKey(userId);
  const enabled = Boolean(pubkey || catalogUser);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const settings = await getSettings(userId);
      return settings;
    },
    enabled,
  });
};
