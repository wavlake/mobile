import * as Keychain from "react-native-keychain";

export const saveSecretToKeychain = async (username: string, nsec: string) => {
  await Keychain.setGenericPassword(username, nsec, {
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
    service: "com.wavlake.mobile",
  });
};

export const getSecretFromKeychain = async () => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return credentials;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Keychain could not be accessed!", error);
    return null;
  }
};

export const deleteSecretFromKeychain = async () => {
  await Keychain.resetGenericPassword();
};
