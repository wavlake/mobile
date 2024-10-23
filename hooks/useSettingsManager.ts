import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/useSettings";
import { useSettingsQueryKey } from "@/hooks/useSettingsQueryKey";
import { cacheSettings, Settings } from "@/utils";

export const useSettingsManager = (pubkey: string | null) => {
  const { data: settings } = useSettings();
  const queryClient = useQueryClient();
  const settingsKey = useSettingsQueryKey();

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!pubkey) return;

    await cacheSettings(newSettings, pubkey);
    queryClient.invalidateQueries(settingsKey);
    return;
  };

  return {
    settings,
    updateSettings,
  };
};
