import { getIsLoggedInWithAmber, setIsLoggedInWithAmber } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import * as IntentLauncher from "expo-intent-launcher";
import { EventTemplate } from "nostr-tools";
import { Platform } from "react-native";

interface AmberSignerResponse {
  signature?: string;
  package?: string;
  id?: string;
  event?: string;
}

export const signEventWithAmber = async (event: EventTemplate) => {
  const res = await IntentLauncher.startActivityAsync(
    "android.intent.action.VIEW",
    {
      data: "nostrsigner:",
      packageName: "com.greenart7c3.nostrsigner",
      type: "sign_event",
      extra: {
        event: JSON.stringify(event),
      },
    },
  );
  console.log("Amber response, sign_event", res);
  return res;
};

export const useAmberSigner = () => {
  const { data: isLoggedInWithAmber, refetch: refetchAmberStatus } = useQuery({
    queryKey: ["isLoggedInWithAmber"],
    queryFn: getIsLoggedInWithAmber,
    staleTime: Infinity,
  });

  const loginWithAmber = async () => {
    if (Platform.OS !== "android") return false;

    try {
      // Request public key from Amber
      const result = await IntentLauncher.startActivityAsync(
        "android.intent.action.VIEW",
        {
          data: "nostrsigner:",
          packageName: "com.greenart7c3.nostrsigner",
          type: "get_public_key",
          extra: {
            permissions: JSON.stringify([
              { type: "sign_event" },
              { type: "nip04_encrypt" },
              { type: "nip04_decrypt" },
            ]),
          },
        },
      );
      console.log("Amber response, get_public_key", result);
      if (result.resultCode !== IntentLauncher.ResultCode.Success) {
        return false;
      }

      const response = result.extra as AmberSignerResponse;
      if (!response.signature) return false;
      await setIsLoggedInWithAmber(true);
      refetchAmberStatus();
      return true;
    } catch (error) {
      console.error("Amber login error:", error);
      return false;
    }
  };

  const checkAmberInstalled = async (): Promise<boolean> => {
    if (Platform.OS !== "android") return false;

    try {
      const result = await IntentLauncher.startActivityAsync(
        "android.intent.action.VIEW",
        {
          data: "nostrsigner:",
          flags: 0,
        },
      );
      console.log("Amber response, check_installed", result);
      return result.resultCode === IntentLauncher.ResultCode.Success;
    } catch {
      return false;
    }
  };

  const getAmberPubkey = async () => {
    if (Platform.OS !== "android") return "";

    try {
      const result = await IntentLauncher.startActivityAsync(
        "android.intent.action.VIEW",
        {
          data: "nostrsigner:",
          packageName: "com.greenart7c3.nostrsigner",
          type: "get_public_key",
        },
      );

      if (result.resultCode !== IntentLauncher.ResultCode.Success) {
        return "";
      }

      const response = result.extra as AmberSignerResponse;
      if (!response.id) return "";

      return response.id;
    } catch (error) {
      console.error("Amber pubkey error:", error);
      return "";
    }
  };

  const logoutFromAmber = async () => {
    if (Platform.OS !== "android") return;

    try {
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: "nostrsigner:",
        packageName: "com.greenart7c3.nostrsigner",
        type: "logout",
      });

      await setIsLoggedInWithAmber(false);
      refetchAmberStatus();
    } catch (error) {
      console.error("Amber logout error:", error);
    }
  };

  return {
    loginWithAmber,
    logoutFromAmber,
    checkAmberInstalled,
    getAmberPubkey,
    isLoggedInWithAmber,
  };
};
