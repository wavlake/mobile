import { Text, Center, CancelButton, useUser } from "@/components";
import { useAuth, useSettingsManager, useToast } from "@/hooks";
import { intakeNwcURI } from "@/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";

export default function AddNWC() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const toast = useToast();
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const { refetch: refetchSettings } = useSettingsManager();
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
          await refetchSettings();
          router.replace("/");

          // fetch the info event and refresh settings after
          await fetchInfo?.();
          await refetchSettings();
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
