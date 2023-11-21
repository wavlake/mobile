import { getPublicKey, nip04 } from "nostr-tools";
import {
  DEFAULT_READ_RELAY_URIS,
  getEventFromPool,
  getNWCInfoEvent,
  sendNWCRequest,
} from "./nostr";
import { getNwcSecret, saveNwcSecret } from "./secureStorage";
import { cacheSettings } from "./cache";

export const payInvoiceCommand = "pay_invoice";
export const getBalanceCommand = "get_balance";
export interface NWCResponsePayInvoice {
  result: {
    preimage: string;
  };
  error?: {
    code: string;
    message: string;
  };
  result_type?: string;
}

export interface NWCResponseGetBalance {
  result: { balance?: number; budget_renewal?: string; max_amount?: number };
  error?: {
    code: string;
    message: string;
  };
  result_type?: string;
}

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
export const intakeNwcURI = async ({
  uri,
  pubkey,
  onUpdate,
}: {
  uri: string;
  pubkey?: string;
  onUpdate?: Function;
}): Promise<{ isSuccess: boolean; error?: string; fetchInfo?: Function }> => {
  if (!pubkey) {
    return { isSuccess: false, error: "please login to use NWC" };
  }

  const {
    isValid,
    relay,
    secret,
    lud16,
    pubkey: nwcPubkey,
  } = validateNwcURI(uri);
  if (!isValid || !secret) {
    return {
      isSuccess: false,
      error: "invalid NWC string, please check the contents and try again",
    };
  }
  await Promise.all([
    saveNwcSecret(secret, pubkey),
    cacheSettings(
      {
        nwcRelay: relay,
        nwcLud16: lud16,
        nwcPubkey,
        // we set these to optimistic truthy values, but validate via the fetchInfo below
        enableNWC: true,
        nwcCommands: [payInvoiceCommand],
      },
      pubkey,
    ),
  ]);

  onUpdate?.("Sucess!");
  return {
    isSuccess: true,
    fetchInfo: () =>
      getWalletServiceCommands({ nwcPubkey, nwcRelay: relay, pubkey }),
  };
};

const validateNwcURI = (uri?: string): URIResult => {
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

const getWalletServiceCommands = async ({
  nwcPubkey,
  nwcRelay,
  pubkey,
}: {
  nwcPubkey?: string;
  pubkey?: string;
  nwcRelay?: string;
}): Promise<string[] | undefined> => {
  if (!nwcPubkey) return;

  const infoEvent = await getNWCInfoEvent(nwcPubkey, nwcRelay);
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

  const enableNWC = nwcCommands?.includes(payInvoiceCommand);
  await cacheSettings({ enableNWC, nwcCommands }, pubkey);
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
}) {
  const { connectionSecret } = await getNwcConnection(userPubkey);
  if (!connectionSecret) {
    // there is no NWC to get a balance for
    return;
  }

  const requestEvent = await sendNWCRequest({
    walletPubkey,
    relay: nwcRelay,
    method: "get_balance",
    connectionSecret,
  });
  if (!requestEvent) {
    throw new Error("Failed to send NWC get balance request");
  }

  const relays =
    nwcRelay === "wss://nostr.mutinywallet.com"
      ? DEFAULT_READ_RELAY_URIS
      : [nwcRelay];
  const response = await handleNwcResponse({
    userPubkey,
    eventId: requestEvent.id,
    walletPubkey,
    relays,
  });

  return response as NWCResponseGetBalance;
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

  const requestEvent = await sendNWCRequest({
    walletPubkey,
    relay: nwcRelay,
    method: "pay_invoice",
    params: { invoice },
    connectionSecret,
  });

  if (!requestEvent) {
    throw new Error("Failed to send NWC request");
  }
  const relays =
    nwcRelay === "wss://nostr.mutinywallet.com"
      ? DEFAULT_READ_RELAY_URIS
      : [nwcRelay];

  const response = (await handleNwcResponse({
    userPubkey,
    eventId: requestEvent.id,
    walletPubkey,
    relays,
  })) as NWCResponsePayInvoice;

  if (!response?.result?.preimage) {
    throw new Error("Failed to pay using NWC");
  }

  return { preimage: response?.result.preimage };
}

async function handleNwcResponse({
  eventId,
  walletPubkey,
  userPubkey,
  relays,
}: {
  eventId: string;
  walletPubkey: string;
  userPubkey: string;
  relays: string[];
}): Promise<NWCResponseGetBalance | NWCResponsePayInvoice> {
  const { connectionSecret, connectionPubkey } =
    await getNwcConnection(userPubkey);
  const filter = {
    kinds: [23195],
    "#p": [connectionPubkey],
    "#e": [eventId],
    authors: [walletPubkey],
  };

  const responseEvent = await getEventFromPool(filter, relays);
  if (!responseEvent) {
    throw new Error("Failed to get NWC response");
  }

  const decryptedResponse = await nip04.decrypt(
    connectionSecret,
    walletPubkey,
    responseEvent.content,
  );

  if (!decryptedResponse) {
    throw new Error("Failed to decrypt NWC response");
  }

  const response = JSON.parse(decryptedResponse);
  if (response.error) {
    throw new Error(`${response.error.code}: ${response.error.message}`);
  }
  return response;
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
    return sendNwcPaymentRequest({
      userPubkey,
      invoice,
      walletPubkey,
      nwcRelay,
    });
  } catch (error) {
    return { error: (error as Error).message || "Unknown error occurred" };
  }
};
