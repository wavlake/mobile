import * as SecureStore from "expo-secure-store";
import { getPublicKey } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

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

    return seckey ? getPublicKey(hexToBytes(seckey)) : "";
  } catch {
    return "";
  }
};

const nwcSecret = "nwcSecret";

export const saveNwcSecret = async (secret: string, pubkey: string) => {
  await SecureStore.setItemAsync(`${pubkey}.${nwcSecret}`, secret);
};

export const getNwcSecret = async (pubkey: string) => {
  return await SecureStore.getItemAsync(`${pubkey}.${nwcSecret}`);
};

export const deleteNwcSecret = async (pubkey: string) => {
  await SecureStore.deleteItemAsync(`${pubkey}.${nwcSecret}`);
};
