import { useAuth } from "./useAuth";
import { getSettings } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useSettingsQueryKey } from "./useSettingsQueryKey";

export const useSettings = () => {
  const { pubkey: userPubkey } = useAuth();
  const queryKey = useSettingsQueryKey();
  const enabled = Boolean(userPubkey);

  const data = useQuery({
    queryKey,
    queryFn: async () => {
      const settings = await getSettings(userPubkey);
      return settings;
    },
    enabled,
  });

  return data;
};
