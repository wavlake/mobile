import { useAmberSigner, useAuth } from "@/hooks";
import { Button } from "./shared";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

export const AmberLoginButton = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [amberInstalled, setAmberInstalled] = useState(false);
  const { isAmberInstalled } = useAmberSigner();

  useEffect(() => {
    isAmberInstalled().then(setAmberInstalled);
  }, []);

  if (!amberInstalled) return;

  return (
    <Button
      onPress={async () => {
        setIsLoading(true);
        const success = await login();
        setIsLoading(false);
        if (success) {
          router.replace("/auth/welcome");
        }
      }}
      loading={isLoading}
    >
      Login with Amber
    </Button>
  );
};
