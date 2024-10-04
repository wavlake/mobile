import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event } from "nostr-tools";
import { WalletKey } from "@/utils";

const isFirstAppLaunchKey = "isFirstAppLaunch";
const isSkipLoginKey = "skipLogin";
const makeNostrProfileEventKey = (pubkey: string) => `${pubkey}.profileEvent`;
const makeNWCInfoEventKey = (pubkey: string) => `${pubkey}.nwcInfoEvent`;
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

const SKIP_LOGIN = "skip-login";
export const setSkipLogin = async () => {
  await storeData(isSkipLoginKey, SKIP_LOGIN);
};

export const shouldForceLogin = async () => {
  return (await getData(isSkipLoginKey)) !== SKIP_LOGIN;
};

export const cacheNostrProfileEvent = async (pubkey: string, event: Event) => {
  const nostrProfileEventKey = makeNostrProfileEventKey(pubkey);

  await storeObjectData(nostrProfileEventKey, event);
};

export const getCachedNostrProfileEvent = async (pubkey: string) => {
  const nostrProfileEventKey = makeNostrProfileEventKey(pubkey);

  return getObjectData(nostrProfileEventKey);
};

export const cacheNWCInfoEvent = async (pubkey: string, event: Event) => {
  const nwcInfoEventKey = makeNWCInfoEventKey(pubkey);

  await storeObjectData(nwcInfoEventKey, event);
};

export const getCachedNWCInfoEvent = async (pubkey: string) => {
  const nwcInfoEventKey = makeNWCInfoEventKey(pubkey);

  return getObjectData(nwcInfoEventKey);
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
  nwcRelay: string;
  nwcLud16: string;
  nwcPubkey: string;
  enableNWC: boolean;
  nwcCommands: string[];
  oneTapZap: boolean;
  publishKind1: boolean;
}

// TODO expose this call thru the settings hook
export const cacheSettings = async (
  settings: Partial<Settings>,
  pubkey?: string,
) => {
  const settingsKey = makeSettingsKey(pubkey);
  const currentSettings = await getSettings(pubkey);
  const newSettings = { ...currentSettings, ...settings };
  await storeObjectData(settingsKey, newSettings);
  return newSettings;
};

export const getSettings = async (pubkey?: string): Promise<Settings> => {
  const settingsKey = makeSettingsKey(pubkey);

  return (await getObjectData(settingsKey)) ?? {};
};
