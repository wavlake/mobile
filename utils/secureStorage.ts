import * as SecureStore from "expo-secure-store";
import { getPublicKey } from "nostr-tools";

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

export const getPubkeyFromCachedSeckey = async () => {
  try {
    const seckey = await getSeckey();

    return seckey ? getPublicKey(seckey) : "";
  } catch {
    return "";
  }
};
