function isValidHexString(str: string): boolean {
  const hexRegEx = /^[0-9a-fA-F]+$/;
  // strip out any forward slashes that may be present
  // e.g. nostr+walletconnect://b889... (mutiny wallet has this)
  str = str.replace(/\//g, "");
  return hexRegEx.test(str) && str.length === 64;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}
function getQueryStringParams(query: string): Record<string, string> {
  return query
    .split("&")
    .reduce((params: Record<string, string>, param: string) => {
      const [key, value] = param.split("=");
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
      return params;
    }, {});
}

interface URIResult {
  isValid: boolean;
  relay?: string;
  secret?: string;
  lud16?: string;
  pubkey?: string;
}

export function validateNwcURI(uri?: string): URIResult {
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
    result.pubkey = pubkey;
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
}

const sampleUri =
  "nostr+walletconnect:b889ff5b1513b641e2a139f661a661364979c5beee91842f8f0ef42ab558e9d4?relay=wss%3A%2F%2Frelay.damus.io&secret=71a8c14c1407c113601079c4302dab36460f0ccd0ad506f1f2dc73b5100e4f3c";
