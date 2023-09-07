import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event } from "nostr-tools";

const storeData = async (key: string, value: string) => {
  await AsyncStorage.setItem(key, value);
};

const getData = async (key: string) => {
  return await AsyncStorage.getItem(key);
};

const storeObjectData = async (cacheKey: string, data: Record<any, any>) => {
  await storeData(cacheKey, JSON.stringify(data));
};

const getObjectData = async (cacheKey: string) => {
  try {
    const data = await getData(cacheKey);

    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const makeNostrProfileEventKey = (pubkey: string) => `${pubkey}.profileEvent`;

export const cacheNostrProfileEvent = async (pubkey: string, event: Event) => {
  const nostrProfileEventKey = makeNostrProfileEventKey(pubkey);

  await storeObjectData(nostrProfileEventKey, event);
};

export const getCachedNostrProfileEvent = async (pubkey: string) => {
  const nostrProfileEventKey = makeNostrProfileEventKey(pubkey);

  return getObjectData(nostrProfileEventKey);
};

const makeNostrRelayListEventKey = (pubkey: string) =>
  `${pubkey}.relayListEvent`;

export const cacheNostrRelayListEvent = async (
  pubkey: string,
  event: Event,
) => {
  const nostrRelayListEventKey = makeNostrRelayListEventKey(pubkey);

  await storeObjectData(nostrRelayListEventKey, event);
};

export const getCachedNostrRelayListEvent = async (pubkey: string) => {
  const nostrRelayListEventKey = makeNostrRelayListEventKey(pubkey);

  return getObjectData(nostrRelayListEventKey);
};
