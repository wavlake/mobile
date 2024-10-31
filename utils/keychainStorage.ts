import * as Keychain from "react-native-keychain";

const SERVICE_NAME = "com.wavlake.mobile";
export const saveSecretToKeychain = async (username: string, nsec: string) => {
  try {
    const genericPw = await Keychain.setGenericPassword(username, nsec, {
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
      service: SERVICE_NAME,
    });
    // const internetCred = await Keychain.setInternetCredentials(
    //   "https://wavlake.com",
    //   username,
    //   nsec,
    //   {
    //     accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
    //     service: "com.wavlake.mobile",
    //   },
    // );

    // Error Domain=NSOSStatusErrorDomain Code=-34018 "wavlake.com not found in com.apple.developer.associated-domains entitlement" UserInfo={numberOfErrorsDeep=0, NSDescription=wavlake.com not found in com.apple.developer.associated-domains entitlement}
    // const sharedWebCred = await Keychain.setSharedWebCredentials(
    //   "wavlake.com",
    //   username,
    //   nsec,
    // );
  } catch (error) {
    console.error("Keychain could not be accessed!", error);
  }
};

export const getSecretFromKeychain = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: SERVICE_NAME,
    });
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
