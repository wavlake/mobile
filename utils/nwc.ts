import { getPublicKey, nip04, relayInit } from "nostr-tools";
import { getNWCInfoEvent, sendNWCRequest } from "./nostr";
import { getNwcSecret, saveNwcSecret } from "./secureStorage";
import { cacheSettings } from "./cache";

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
export const intakeNwcURI = async ({
  uri,
  pubkey,
  onUpdate,
  onSucess,
  onError,
}: {
  uri: string;
  pubkey?: string;
  onUpdate?: Function;
  onSucess?: Function;
  onError?: Function;
}): Promise<void> => {
  if (!pubkey) {
    onError?.("please login to use NWC");
    return;
  }

  const {
    isValid,
    relay,
    secret,
    lud16,
    pubkey: nwcPubkey,
  } = validateNwcURI(uri);
  if (!isValid || !secret) {
    onError?.("invalid NWC string, please check the contents and try again");
    return;
  }

  await Promise.all([
    saveNwcSecret(secret, pubkey),
    cacheSettings(
      {
        nwcRelay: relay,
        nwcLud16: lud16,
        nwcPubkey,
      },
      pubkey,
    ),
  ]);

  getWalletServiceCommands({ nwcPubkey, nwcRelay: relay, pubkey });
  onUpdate?.("Sucess!");
  onSucess?.();

  return;
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
}): Promise<{ eventId: string }> {
  const { connectionSecret } = await getNwcConnection(userPubkey);

  const eventId = await sendNWCRequest({
    walletPubkey,
    relay: nwcRelay,
    method: "pay_invoice",
    params: { invoice },
    connectionSecret,
  });
  if (!eventId) {
    throw new Error("Failed to send NWC payment request");
  }
  return { eventId };
}

interface NWCResponse {
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
}): Promise<{ preimage: string } | void> {
  const walletServiceRelay = relayInit(nwcRelay);
  walletServiceRelay.on("error", () => {
    throw new Error(`failed to connect to ${nwcRelay}`);
  });

  walletServiceRelay.connect();

  const { connectionSecret, connectionPubkey } =
    await getNwcConnection(userPubkey);
  const responseSub = walletServiceRelay.sub([
    {
      kinds: [23195],
      "#p": [connectionPubkey],
      "#e": [eventId],
      authors: [walletPubkey],
    },
  ]);
  return new Promise((resolve, reject) => {
    responseSub.on("event", async (event) => {
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

        resolve({ preimage: response.result.preimage });
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
    const { eventId } = await sendNwcPaymentRequest({
      userPubkey,
      invoice,
      walletPubkey,
      nwcRelay,
    });

    return await handleNwcResponse({
      userPubkey,
      eventId,
      walletPubkey,
      nwcRelay,
    });
  } catch (error) {
    return { error: (error as Error).message || "Unknown error occurred" };
  }
};
