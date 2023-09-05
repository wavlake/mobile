import { decodeNsec } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import * as SecureStore from "expo-secure-store";

const seckey = "seckey";

export const saveSeckey = async (value: string) => {
  await SecureStore.setItemAsync(seckey, value);
};

export const getSeckey = async () => {
  return await SecureStore.getItemAsync(seckey);
};

export const deleteSeckey = async () => {
  await SecureStore.deleteItemAsync(seckey);
};

export const useAuth = () => {
  const navigation = useNavigation();
  const { data, refetch } = useQuery({
    queryKey: ["auth"],
    queryFn: getSeckey,
    staleTime: Infinity,
  });
  const login = async (nsec: string) => {
    const seckey = decodeNsec(nsec);

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

  return { login, logout, isLoggedIn: Boolean(data), goToRoot };
};
