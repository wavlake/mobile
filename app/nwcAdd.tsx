import { Text, Center, CancelButton, useUser } from "@/components";
import { useAuth, useToast } from "@/hooks";
import { useSettingsQueryKey } from "@/hooks/useSettingsQueryKey";
import { intakeNwcURI } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";

export default function AddNWC() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useLocalSearchParams();
  const toast = useToast();
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const settingsKey = useSettingsQueryKey();
  const userIdOrPubkey = catalogUser?.id ?? pubkey;

  useEffect(() => {
    const asyncFunction = async () => {
      const { uri } = params;
      if (uri && pubkey) {
        const { isSuccess, error, fetchInfo } = await intakeNwcURI({
          uri: uri as string,
          userIdOrPubkey,
        });
        if (isSuccess) {
          queryClient.invalidateQueries(settingsKey);
          router.replace("/");

          // fetch the info event and refresh settings after
          await fetchInfo?.();
          queryClient.invalidateQueries(settingsKey);
        } else {
          error && toast.show(error);
          router.replace("/");
        }
      }
    };
    asyncFunction();
  }, [params, pubkey]);

  return (
    <Center
      style={{
        gap: 20,
      }}
    >
      <ActivityIndicator animating={true} size="large" />
      <Text>Validating connection...</Text>
      <CancelButton />
    </Center>
  );
}
