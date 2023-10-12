import {
  decodeNsec,
  saveSeckey,
  deleteSeckey,
  getPubkeyFromCachedSeckey,
  encodeNsec,
} from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";

export const useAuth = () => {
  const navigation = useNavigation();
  const { data: pubkey, refetch } = useQuery({
    queryKey: ["auth"],
    queryFn: getPubkeyFromCachedSeckey,
    staleTime: Infinity,
  });
  const login = async (privkey: string) => {
    const seckey = privkey.startsWith("nsec")
      ? decodeNsec(privkey)
      : decodeNsec(encodeNsec(privkey) ?? ""); // encode and then decode hex privkey to make sure it is valid

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
