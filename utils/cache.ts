import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event } from "nostr-tools";
import { WalletKey } from "@/constants";

const makeNostrProfileEventKey = (pubkey: string) => `${pubkey}.profileEvent`;
const makeNostrRelayListEventKey = (pubkey: string) =>
  `${pubkey}.relayListEvent`;
const makeDefaultZapAmountKey = (pubkey?: string) => {
  return `${pubkey || "anonymous"}.defaultZapAmount`;
};
const makeDefaultZapWalletKey = (pubkey?: string) =>
  `${pubkey || "anonymous"}.defaultZapWallet`;

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

export const cacheNostrProfileEvent = async (pubkey: string, event: Event) => {
  const nostrProfileEventKey = makeNostrProfileEventKey(pubkey);

  await storeObjectData(nostrProfileEventKey, event);
};

export const getCachedNostrProfileEvent = async (pubkey: string) => {
  const nostrProfileEventKey = makeNostrProfileEventKey(pubkey);

  return getObjectData(nostrProfileEventKey);
};

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

export const cacheDefaultZapAmount = async (
  defaultZapAmount: string,
  pubkey?: string,
) => {
  const defaultZapAmountKey = makeDefaultZapAmountKey(pubkey);

  await storeData(defaultZapAmountKey, defaultZapAmount);
};

export const getDefaultZapAmount = async (pubkey?: string) => {
  const defaultZapAmountKey = makeDefaultZapAmountKey(pubkey);

  return getData(defaultZapAmountKey);
};

export const cacheDefaultZapWallet = async (
  defaultZapWallet: WalletKey,
  pubkey?: string,
) => {
  const defaultZapWalletKey = makeDefaultZapWalletKey(pubkey);

  await storeData(defaultZapWalletKey, defaultZapWallet);
};

export const getDefaultZapWallet = async (pubkey?: string) => {
  const defaultZapWalletKey = makeDefaultZapWalletKey(pubkey);

  return getData(defaultZapWalletKey);
};
