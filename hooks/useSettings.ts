import { useAuth } from "./useAuth";
import { getSettings } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useSettingsQueryKey } from "./useSettingsQueryKey";

export const useSettings = () => {
  const { pubkey: userPubkey } = useAuth();

  const queryKey = useSettingsQueryKey();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!userPubkey) return;
      const settings = await getSettings(userPubkey);
      return settings;
    },
    enabled: Boolean(userPubkey),
  });
};
