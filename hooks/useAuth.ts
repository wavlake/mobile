import { bytesToHex } from "@noble/hashes/utils";
import {
  saveSeckey,
  deleteSeckey,
  getPubkeyFromCachedSeckey,
  deleteNwcSecret,
  getKeysFromNostrSecret,
  getAmberPubkey,
} from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { useAmberSigner } from "./useAmberSigner";
import { useToast } from "./useToast";

// this hook manage's the user's locally stored private key
export const useAuth = () => {
  const toast = useToast();
  const { loginWithAmber, logoutFromAmber } = useAmberSigner();
  const navigation = useNavigation();

  const { data: pubkey, refetch: refetchPubkey } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const amberPubkey = await getAmberPubkey();

      if (amberPubkey && amberPubkey !== "") {
        return amberPubkey;
      }

      return getPubkeyFromCachedSeckey();
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const login = async (privkey?: string) => {
    // Try to login with remote signer
    if (!privkey) {
      const success = await loginWithAmber();

      if (success) {
        // clear out any existing seckey
        await deleteSeckey();
        await refetchPubkey();
        return true;
      } else {
        toast.show("Failed to login with remote signer");
        return false;
      }
    }

    // Regular private key login
    const { seckey } = getKeysFromNostrSecret(privkey) || {};
    if (!seckey) return false;

    const hexPrivateKey = bytesToHex(seckey);
    if (hexPrivateKey.length !== 64) return false;

    await saveSeckey(hexPrivateKey);
    await refetchPubkey();
    return true;
  };

  const logout = async () => {
    const amberPubkey = await getAmberPubkey().catch((e) => {
      return "";
    });

    if (amberPubkey && amberPubkey !== "") {
      await logoutFromAmber();
    }

    await deleteSeckey();
    // delete wallet connection associated with pubkey
    pubkey && (await deleteNwcSecret(pubkey));
    await refetchPubkey();
  };

  const goToRoot = async () => {
    navigation.getParent()?.goBack();
  };

  return {
    login,
    logout,
    pubkey: pubkey ?? "",
    goToRoot,
    userIsLoggedIn: !!pubkey && pubkey !== "",
  };
};
