import { bytesToHex } from "@noble/hashes/utils";
import {
  saveSeckey,
  deleteSeckey,
  getPubkeyFromCachedSeckey,
  deleteNwcSecret,
  getKeysFromNostrSecret,
} from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { useAmberSigner } from "./useAmberSigner";
import { useToast } from "./useToast";

// this hook manage's the user's locally stored private key
export const useAuth = () => {
  const toast = useToast();
  const {
    loginWithAmber,
    checkAmberInstalled,
    getAmberPubkey,
    isLoggedInWithAmber,
    logoutFromAmber,
  } = useAmberSigner();
  const navigation = useNavigation();

  const { data: pubkey, refetch: refetchPubkey } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      if (isLoggedInWithAmber) {
        return getAmberPubkey();
      }

      return getPubkeyFromCachedSeckey();
    },
    staleTime: Infinity,
  });

  const login = async (privkey?: string) => {
    const isAmberInstalled = await checkAmberInstalled();
    if (isAmberInstalled) {
      // If Amber is installed, we try to use it to sign in
      const success = await loginWithAmber();
      if (success) {
        await refetchPubkey();
        return true;
      } else {
        toast.show("Failed to login with Amber");
      }
    }

    // if Amber is not installed, or unsuccessful, we login with the provided private key
    if (!privkey) return false;

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
    if (isLoggedInWithAmber) {
      await logoutFromAmber();
    } else {
      await deleteSeckey();
      pubkey && (await deleteNwcSecret(pubkey));
      await refetchPubkey();
    }
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
