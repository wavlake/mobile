import {
  decodeNsec,
  getPublicKey,
  getSeckey,
  saveSeckey,
  deleteSeckey,
} from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";

const getPubkeyFromCachedSeckey = async () => {
  try {
    const seckey = await getSeckey();

    return seckey ? getPublicKey(seckey) : "";
  } catch {
    return "";
  }
};

export const useAuth = () => {
  const navigation = useNavigation();
  const { data: pubkey, refetch } = useQuery({
    queryKey: ["auth"],
    queryFn: getPubkeyFromCachedSeckey,
    staleTime: Infinity,
  });
  const login = async (privkey: string) => {
    const seckey = privkey.startsWith("nsec") ? decodeNsec(privkey) : privkey;

    if (!seckey) {
      return false;
    }

    await saveSeckey(seckey);
    await refetch();

    return true;
  };
  const logout = async () => {
    await deleteSeckey();
    await refetch();
  };
  const goToRoot = async () => {
    navigation.getParent()?.goBack();
  };

  return { login, logout, pubkey, goToRoot };
};
