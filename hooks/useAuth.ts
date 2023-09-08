import { decodeNsec, getPublicKey } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useMemo } from "react";
import { EventTemplate, finishEvent, nip19 } from "nostr-tools";

const seckey = "seckey";

const saveSeckey = async (value: string) => {
  await SecureStore.setItemAsync(seckey, value);
};

const getSeckey = async () => {
  return await SecureStore.getItemAsync(seckey);
};

const deleteSeckey = async () => {
  await SecureStore.deleteItemAsync(seckey);
};

const signEvent = async (event: EventTemplate) => {
  const seckey = await getSeckey();

  if (seckey) {
    return finishEvent(event, seckey);
  }
};

export const useAuth = () => {
  const navigation = useNavigation();
  const { data: seckey, refetch } = useQuery({
    queryKey: ["auth"],
    queryFn: getSeckey,
    staleTime: Infinity,
  });
  const pubkey = useMemo(() => {
    try {
      return seckey ? getPublicKey(seckey) : "";
    } catch {
      return "";
    }
  }, [seckey]);
  const npub = useMemo(() => {
    try {
      return pubkey ? nip19.npubEncode(pubkey) : "";
    } catch {
      return "";
    }
  }, [pubkey]);
  const nsec = useMemo(() => {
    try {
      return seckey ? nip19.nsecEncode(seckey) : "";
    } catch {
      return "";
    }
  }, [seckey]);
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

  return { login, logout, pubkey, npub, nsec, goToRoot, signEvent };
};
