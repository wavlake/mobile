import { getPublicKey, nip04, relayInit } from "nostr-tools";
import { getNWCInfoEvent, sendNWCRequest } from "./nostr";
import { getNwcSecret } from "./secureStorage";

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

async function getNwcConnection(userPubkey: string): Promise<{
  connectionSecret: string;
  connectionPubkey: string;
}> {
  const connectionSecret = await getNwcSecret(userPubkey);
  if (!connectionSecret) {
    throw new Error("Missing NWC secret");
  }
  return {
    connectionSecret,
    connectionPubkey: getPublicKey(connectionSecret),
  };
}

export async function getNwcBalance({
  userPubkey,
  walletPubkey,
  nwcRelay,
}: {
  userPubkey: string;
  walletPubkey: string;
  nwcRelay: string;
}): Promise<any> {
  console.log("getNwcBalance");
  const { connectionSecret } = await getNwcConnection(userPubkey);
  const response = await sendNWCRequest({
    walletPubkey,
    relay: nwcRelay,
    method: "get_balance",
    connectionSecret,
  });

  return response;
}

async function sendNwcPaymentRequest({
  userPubkey,
  invoice,
  walletPubkey,
  nwcRelay,
}: {
  userPubkey: string;
  invoice: string;
  walletPubkey: string;
  nwcRelay: string;
}): Promise<{ preimage: string }> {
  const { connectionSecret } = await getNwcConnection(userPubkey);

  const response = await sendNWCRequest({
    walletPubkey,
    relay: nwcRelay,
    method: "pay_invoice",
    params: { invoice },
    connectionSecret,
  });
  if (!response?.result?.preimage) {
    throw new Error("Failed to pay using NWC");
  }
  return { preimage: response?.result.preimage };
}

export interface NWCResponse {
  result: {
    preimage: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

async function handleNwcResponse({
  eventId,
  walletPubkey,
  userPubkey,
  nwcRelay,
}: {
  eventId: string;
  walletPubkey: string;
  userPubkey: string;
  nwcRelay: string;
}): Promise<any> {
  const walletServiceRelay = relayInit(nwcRelay);
  walletServiceRelay.on("error", () => {
    throw new Error(`failed to connect to ${nwcRelay}`);
  });

  walletServiceRelay.connect();

  const { connectionSecret, connectionPubkey } =
    await getNwcConnection(userPubkey);
  const offsetTime = 10;
  const since = Math.round(Date.now() / 1000) - offsetTime;
  const responseSub = walletServiceRelay.sub([
    {
      kinds: [23195],
      // "#p": [connectionPubkey],
      "#e": [eventId],
      // authors: [walletPubkey],
      since,
    },
  ]);
  console.log("subbed", { connectionPubkey, eventId, walletPubkey });
  return new Promise((resolve, reject) => {
    responseSub.on("event", async (event) => {
      console.log("event", event);
      console.log(event.tags);
      try {
        const decryptedResponse = await nip04.decrypt(
          connectionSecret,
          walletPubkey,
          event.content,
        );
        if (!decryptedResponse) {
          throw new Error("Failed to decrypt NWC response");
        }

        const response: NWCResponse = JSON.parse(decryptedResponse);
        if (response.error) {
          throw new Error(`${response.error.code}: ${response.error.message}`);
        }

        resolve(response);
      } catch (error) {
        reject((error as Error).message || "Unknown error occurred");
      } finally {
        responseSub.unsub();
      }
    });
  });
}

export const payWithNWC = async ({
  userPubkey,
  invoice,
  walletPubkey,
  nwcRelay,
}: {
  userPubkey: string;
  invoice: string;
  walletPubkey: string;
  nwcRelay: string;
}): Promise<{ preimage?: string; error?: string } | void> => {
  try {
    const preimage = await sendNwcPaymentRequest({
      userPubkey,
      invoice,
      walletPubkey,
      nwcRelay,
    });

    // const response = await handleNwcResponse({
    //   userPubkey,
    //   eventId,
    //   walletPubkey,
    //   nwcRelay,
    // });
    return { preimage };
  } catch (error) {
    return { error: (error as Error).message || "Unknown error occurred" };
  }
};
