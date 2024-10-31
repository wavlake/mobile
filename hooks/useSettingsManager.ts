import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/useSettings";
import { useSettingsQueryKey } from "@/hooks/useSettingsQueryKey";
import { cacheSettings, Settings } from "@/utils";
import { useUser } from "@/components";
import { useAuth } from "./useAuth";

export const useSettingsManager = () => {
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();

  const userId = catalogUser?.id ?? pubkey;
  const { data: settings, refetch } = useSettings();
  const queryClient = useQueryClient();
  const settingsKey = useSettingsQueryKey(userId);

  const updateSettings = async (
    newSettings: Partial<Settings>,
    overrideUserId?: string | null,
  ) => {
    if (!userId && !overrideUserId) return;
    const uid = overrideUserId ?? userId;
    // TODO - handle when a user logs in with only a pubkey, and then links to their wavlake account
    // tranasfer their settings over to the new user id

    // for now, save settings to both the user and the pubkey
    uid && (await cacheSettings(newSettings, uid));
    pubkey && (await cacheSettings(newSettings, pubkey));
    queryClient.invalidateQueries(settingsKey);
    refetch();
    return;
  };

  return {
    settings,
    refetch,
    updateSettings,
  };
};
