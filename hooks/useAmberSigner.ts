import { setAmberPubkey } from "@/utils";
import * as IntentLauncher from "expo-intent-launcher";
import { Event, EventTemplate, nip19 } from "nostr-tools";
import { Platform } from "react-native";
import { checkInstalledApps } from "expo-check-installed-apps";
interface AmberSignerResponse {
  event?: string;
  id?: string;
  package?: string;
  result?: string;
  signature?: string;
}

const AMBER_PKG = "com.greenart7c3.nostrsigner";
const SCHEME = "nostrsigner";

export const signEventWithAmber = async (event: EventTemplate) => {
  const eventJson = JSON.stringify(event);
  const result = await IntentLauncher.startActivityAsync(
    "android.intent.action.VIEW",
    {
      // Include the content in the URI as specified in the Amber docs
      data: `${SCHEME}:${eventJson}`,
      packageName: AMBER_PKG,
      // Add these flags as mentioned in the Amber docs for signing multiple events
      // flags: 0x14000000, // FLAG_ACTIVITY_SINGLE_TOP | FLAG_ACTIVITY_CLEAR_TOP
      extra: {
        type: "sign_event",
      },
    },
  );
  const response = result.extra as AmberSignerResponse;
  if (!response.event) {
    console.error("No event returned from signer", response);
    return null;
  }

  const signedEvent: Event = JSON.parse(response.event);
  return signedEvent;
};

export const useAmberSigner = () => {
  const loginWithAmber = async () => {
    if (Platform.OS !== "android") return false;

    try {
      const permissions = [
        { type: "sign_event" },
        { type: "nip04_encrypt" },
        { type: "nip04_decrypt" },
      ];

      const result = await IntentLauncher.startActivityAsync(
        "android.intent.action.VIEW",
        {
          data: `${SCHEME}:`,
          packageName: AMBER_PKG,
          extra: {
            type: "get_public_key",
            permissions: JSON.stringify(permissions),
          },
        },
      );

      if (result.resultCode !== IntentLauncher.ResultCode.Success) {
        return false;
      }

      const response = result.extra as AmberSignerResponse;
      if (!response.signature) return false;

      const { type, data } = nip19.decode(response.signature);
      if (type === "npub") {
        await setAmberPubkey(data);
      } else {
        console.error("Invalid Amber pubkey type:", type);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Amber login error:", error);
      return false;
    }
  };

  const logoutFromAmber = async () => {
    try {
      if (Platform.OS !== "android") return;

      // clear the app's stored pubkey
      await setAmberPubkey("");

      // the user will be redirected to amber to logout
      IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: `${SCHEME}:`,
        packageName: AMBER_PKG,
        extra: {
          type: "logout",
        },
      });

      return true;
    } catch (error) {
      console.error("Amber logout error:", error);
    }
  };

  const isAmberInstalled = async () => {
    try {
      const packageNames: string[] =
        Platform.select({
          android: [AMBER_PKG], // Use package name of android apps
          ios: [`${SCHEME}:`], // unused, currently no ios signer app
        }) || [];

      const result = await checkInstalledApps(packageNames);
      return result[AMBER_PKG] ?? false;
    } catch (error) {
      console.error("Error checking installed apps:", error);
      return false;
    }
  };

  return {
    loginWithAmber,
    logoutFromAmber,
    isAmberInstalled,
  };
};
