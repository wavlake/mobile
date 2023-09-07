import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event } from "nostr-tools";

const storeData = async (key: string, value: string) => {
  await AsyncStorage.setItem(key, value);
};

const getData = async (key: string) => {
  return await AsyncStorage.getItem(key);
};

const makeNostrProfileEventKey = (pubkey: string) => `${pubkey}.profileEvent`;

export const cacheNostrProfileEvent = async (pubkey: string, event: Event) => {
  const nostrProfileEventKey = makeNostrProfileEventKey(pubkey);

  await storeData(nostrProfileEventKey, JSON.stringify(event));
};

export const getCachedNostrProfileEvent = async (pubkey: string) => {
  const nostrProfileEventKey = makeNostrProfileEventKey(pubkey);

  try {
    const profile = await getData(nostrProfileEventKey);

    return profile ? JSON.parse(profile) : null;
  } catch {
    return null;
  }
};
