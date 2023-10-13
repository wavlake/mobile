import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event } from "nostr-tools";
import { WalletKey } from "@/utils";

const isFirstAppLaunchKey = "isFirstAppLaunch";
const makeNostrProfileEventKey = (pubkey: string) => `${pubkey}.profileEvent`;
const makeNostrRelayListEventKey = (pubkey: string) =>
  `${pubkey}.relayListEvent`;
const makeSettingsKey = (pubkey?: string) =>
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

export const cacheIsFirstAppLaunch = async () =>
  storeData(isFirstAppLaunchKey, "1");

export const getIsFirstAppLaunch = async () => {
  return (await getData(isFirstAppLaunchKey)) === null;
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

export const getCachedNostrRelayListEvent = async (
  pubkey: string,
): Promise<Event | null> => {
  const nostrRelayListEventKey = makeNostrRelayListEventKey(pubkey);

  return getObjectData(nostrRelayListEventKey);
};

export interface Settings {
  defaultZapAmount: string;
  defaultZapWallet: WalletKey;
  allowListeningActivity: boolean;
}

export const cacheSettings = async (
  settings: Partial<Settings>,
  pubkey?: string,
) => {
  const settingsKey = makeSettingsKey(pubkey);
  const currentSettings = await getSettings(pubkey);

  await storeObjectData(settingsKey, { ...currentSettings, ...settings });
};

export const getSettings = async (pubkey?: string) => {
  const settingsKey = makeSettingsKey(pubkey);

  return (await getObjectData(settingsKey)) ?? {};
};
