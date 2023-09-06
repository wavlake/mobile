import AsyncStorage from "@react-native-async-storage/async-storage";

const storeData = async (key: string, value: string) => {
  await AsyncStorage.setItem(key, value);
};

const getData = async (key: string) => {
  return await AsyncStorage.getItem(key);
};

const makeNostrProfileKey = (pubkey: string) => `${pubkey}.profile`;

export const cacheNostrProfile = async (pubkey: string, profile: string) => {
  const nostrProfileKey = makeNostrProfileKey(pubkey);

  await storeData(nostrProfileKey, profile);
};

export const getCachedNostrProfile = async (pubkey: string) => {
  const nostrProfileKey = makeNostrProfileKey(pubkey);

  try {
    const profile = await getData(nostrProfileKey);

    return profile ? JSON.parse(profile) : null;
  } catch {
    return null;
  }
};
