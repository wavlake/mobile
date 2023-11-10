import { getNWCInfoEvent } from "./nostr";

export const payInvoiceCommand = "pay_invoice";
export const getBalanceCommand = "get_balance";

const isValidHexString = (str: string): boolean => {
  const hexRegEx = /^[0-9a-fA-F]+$/;
  // strip out any forward slashes that may be present
  // e.g. nostr+walletconnect://b889... (mutiny wallet has this)
  str = str.replace(/\//g, "");
  return hexRegEx.test(str) && str.length === 64;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};
const getQueryStringParams = (query: string): Record<string, string> => {
  return query
    .split("&")
    .reduce((params: Record<string, string>, param: string) => {
      const [key, value] = param.split("=");
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
      return params;
    }, {});
};

interface URIResult {
  isValid: boolean;
  relay?: string;
  secret?: string;
  lud16?: string;
  pubkey?: string;
}

export const validateNwcURI = (uri?: string): URIResult => {
  let isValid = true;
  const result: URIResult = {
    isValid: false,
    relay: undefined,
    secret: undefined,
    lud16: undefined,
    pubkey: undefined,
  };

  if (!uri) return result;

  // Check for correct protocol and extract the rest
  if (!uri.startsWith("nostr+walletconnect:")) {
    return result;
  }

  const withoutProtocol = uri.slice("nostr+walletconnect:".length);
  const [pubkey, queryString] = withoutProtocol.split("?");

  // Check hex-encoded pubkey
  if (isValidHexString(pubkey)) {
    // strip out forward slashes
    result.pubkey = pubkey.replace(/\//g, "");
  } else {
    isValid = false;
  }

  // Parse query string
  const params = getQueryStringParams(queryString);

  const relay = params["relay"];
  const secret = params["secret"];
  const lud16 = params["lud16"];

  if (relay && isValidUrl(decodeURIComponent(relay))) {
    result.relay = decodeURIComponent(relay);
  } else {
    isValid = false;
  }

  if (secret && isValidHexString(secret)) {
    result.secret = secret;
  } else {
    isValid = false;
  }

  if (lud16) {
    // lud16 is optional
    if (/^.+@.+\..+$/.test(lud16)) {
      result.lud16 = lud16;
    } else {
      isValid = false;
    }
  }

  result.isValid = isValid;
  return result;
};

export const getWalletServiceCommands = async (
  pubkey?: string,
  relayUri?: string,
): Promise<string[] | undefined> => {
  if (!pubkey) return;

  const infoEvent = await getNWCInfoEvent(pubkey, relayUri);
  // the spec says the should be space separated, but alby is using commas
  // so we try both
  const nwcCommandsComma = infoEvent?.content.split(",");
  const nwcCommandsSpace = infoEvent?.content.split(" ");
  // see which one is defined and has a length of at least 1
  let nwcCommands;
  // check if the array has any items with spaces in it
  if (
    Array.isArray(nwcCommandsComma) &&
    nwcCommandsComma.length > 0 &&
    !nwcCommandsComma.some((key) => key.includes(" "))
  ) {
    nwcCommands = nwcCommandsComma;
  } else if (
    Array.isArray(nwcCommandsSpace) &&
    nwcCommandsSpace.length > 0 &&
    !nwcCommandsSpace.some((key) => key.includes(","))
  ) {
    nwcCommands = nwcCommandsSpace;
  }

  return nwcCommands;
};
