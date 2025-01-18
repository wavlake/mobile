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

// this hook manage's the user's locally stored private key
export const useAuth = () => {
  const navigation = useNavigation();
  const { data: pubkey, refetch } = useQuery({
    queryKey: ["auth"],
    queryFn: getPubkeyFromCachedSeckey,
    staleTime: Infinity,
  });

  const login = async (privkey: string) => {
    const { seckey } = getKeysFromNostrSecret(privkey) || {};

    if (!seckey) {
      return false;
    }

    const hexPrivateKey = bytesToHex(seckey);
    if (hexPrivateKey.length !== 64) {
      return false;
    }

    await saveSeckey(hexPrivateKey);
    await refetch();

    return true;
  };
  const logout = async () => {
    await deleteSeckey();
    pubkey && (await deleteNwcSecret(pubkey));
    await refetch();
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
