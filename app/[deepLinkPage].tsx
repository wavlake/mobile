import { Text, Center, CancelButton } from "@/components";
import { useAuth, useToast } from "@/hooks";
import { intakeNwcURI } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  const [status, setStatus] = useState("Validating secret...");

  useEffect(() => {
    const asyncFunction = async () => {
      if (url && pubkey) {
        if (url.includes("nostr+walletconnect")) {
          await intakeNwcURI({
            uri: url,
            pubkey,
            onUpdate: (message: string) => {
              setStatus(message);
            },
            onSucess: () => {
              toast.show("Successfully paired with Wallet");
            },
            onError: (error: string) => {
              toast.show(error);
            },
          });
        }
        router.replace("/");
      }
    };
    asyncFunction();
  }, [url, pubkey]);

  return (
    <Center
      style={{
        gap: 20,
      }}
    >
      <ActivityIndicator animating={true} size="large" />
      <Text>{status}</Text>
      <CancelButton />
    </Center>
  );
}
