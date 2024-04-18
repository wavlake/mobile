import {
  decodeNsec,
  saveSeckey,
  deleteSeckey,
  getPubkeyFromCachedSeckey,
  encodeNsec,
} from "@/utils";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import { useState } from "react";

export const useAuth = () => {
  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseAuthTypes.User | null>();
  console.log("useAuth", firebaseUser);
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

    if (!seckey || seckey.length !== 64) {
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

  return { login, logout, pubkey, goToRoot, firebaseUser, setFirebaseUser };
};
