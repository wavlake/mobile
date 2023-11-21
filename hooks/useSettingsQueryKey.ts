import { useAuth } from "@/hooks/useAuth";

export const useSettingsQueryKey = () => {
  const { pubkey } = useAuth();

  return ["settings", pubkey];
};
