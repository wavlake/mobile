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

export const saveNwcSecret = async (secret: string, userIdOrPubkey: string) => {
  await SecureStore.setItemAsync(`${userIdOrPubkey}.${nwcSecret}`, secret);
};

export const getNwcSecret = async (userIdOrPubkey: string) => {
  return await SecureStore.getItemAsync(`${userIdOrPubkey}.${nwcSecret}`);
};

export const deleteNwcSecret = async (userIdOrPubkey: string) => {
  await SecureStore.deleteItemAsync(`${userIdOrPubkey}.${nwcSecret}`);
};
