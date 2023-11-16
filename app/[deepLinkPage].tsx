import { Text, Center, CancelButton } from "@/components";
import { useAuth, useToast } from "@/hooks";
import { intakeNwcURI } from "@/utils";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function DeepLinkPage() {
  const url = Linking.useURL();
  const toast = useToast();
  const { pubkey } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState("Validating secret...");

  useEffect(() => {
    const asyncFunction = async () => {
      if (url) {
        if (url.includes("nostr+walletconnect")) {
          console.log("pairing with wallet");
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
  }, [url]);

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
