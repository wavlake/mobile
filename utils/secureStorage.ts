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

const nwcURI = "nwcURI";

export const saveNwcURI = async (value: string, pubkey?: string) => {
  await SecureStore.setItemAsync(`${pubkey}.${nwcURI}`, value);
};

export const getNwcURI = async (pubkey?: string) => {
  return await SecureStore.getItemAsync(`${pubkey}.${nwcURI}`);
};

export const deleteNwcURI = async (pubkey?: string) => {
  await SecureStore.deleteItemAsync(`${pubkey}.${nwcURI}`);
};
