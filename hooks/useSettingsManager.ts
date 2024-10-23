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

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!userId) return;

    // TODO - handle when a user logs in with only a pubkey, and then links to their wavlake account
    // tranasfer their settings over tobecome oprhaned

    // for now, save settings to both the user and the pubkey
    catalogUser?.id && (await cacheSettings(newSettings, catalogUser?.id));
    pubkey && (await cacheSettings(newSettings, pubkey));
    queryClient.invalidateQueries(settingsKey);
    return;
  };

  return {
    settings,
    refetch,
    updateSettings,
  };
};
