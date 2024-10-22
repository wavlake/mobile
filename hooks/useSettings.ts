import { useAuth } from "./useAuth";
import { getSettings } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useSettingsQueryKey } from "./useSettingsQueryKey";
import { useUser } from "@/components";

export const useSettings = () => {
  const { pubkey: userPubkey } = useAuth();
  const { catalogUser } = useUser();
  const queryKey = useSettingsQueryKey();
  const enabled = Boolean(userPubkey);

  const data = useQuery({
    queryKey,
    queryFn: async () => {
      const settings = await getSettings(catalogUser?.id ?? userPubkey);
      return settings;
    },
    enabled,
  });

  return data;
};
