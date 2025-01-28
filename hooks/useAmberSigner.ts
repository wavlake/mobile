import { nip19 } from "nostr-tools";
import { Platform } from "react-native";
import {
  getAmberPublicKey,
  isAmberInstalled,
  logoutFromAmber,
  setAmberPubkey,
} from "@/utils";

export const useAmberSigner = () => {
  const loginWithAmber = async () => {
    if (Platform.OS !== "android") return false;

    try {
      const permissions = [
        { type: "sign_event" },
        { type: "nip04_encrypt" },
        { type: "nip04_decrypt" },
      ];

      const publicKey = await getAmberPublicKey(permissions);

      if (!publicKey) {
        console.error("No pubkey returned from Amber");
        return false;
      }

      const { type, data } = nip19.decode(publicKey);
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

  return {
    loginWithAmber,
    logoutFromAmber,
    isAmberInstalled,
  };
};
