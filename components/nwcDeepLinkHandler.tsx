import { Text, Center, CancelButton } from "@/components";
import { useAuth, useToast } from "@/hooks";
import { useSettingsQueryKey } from "@/hooks/useSettingsQueryKey";
import { intakeNwcURI } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";

export default function DeepLinkPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery(["deepLink"], () =>
    queryClient.getQueryData(["deepLink"]),
  );
  const url = data as string;

  const toast = useToast();
  const { pubkey } = useAuth();
  const router = useRouter();
  const settingsKey = useSettingsQueryKey();

  useEffect(() => {
    const asyncFunction = async () => {
      if (url && pubkey) {
        if (url.includes("nostr+walletconnect")) {
          const { isSuccess, error, fetchInfo } = await intakeNwcURI({
            uri: url,
            pubkey,
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
      }
    };
    if (url === "notification.click") {
      router.replace("/player");
    }
    asyncFunction();
  }, [url, pubkey]);

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
