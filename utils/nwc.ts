import { hexToBytes } from "@noble/hashes/utils";
import { Event, getPublicKey, nip04 } from "nostr-tools";
import {
  getEventFromRelay,
  getNWCInfoEvent,
  makeNWCRequestEvent,
  publishEvent,
} from "./nostr";
import { getNwcSecret, saveNwcSecret } from "./secureStorage";
import { cacheSettings } from "./cache";

export const MUTINY_RELAY = "wss://relay.mutinywallet.com";
type NWCError = {
  code: string;
  message: string;
};

// Base type for all NWC responses
type NWCResponseBase<T extends string, R> = {
  result_type: T;
  result?: R;
  error?: NWCError;
};

// Specific response types
type PayInvoiceResponse = NWCResponseBase<
  "pay_invoice",
  { preimage: string; balance?: number }
>;

type InvoiceResult = {
  type: "incoming" | "outgoing";
  invoice?: string;
  description?: string;
  description_hash?: string;
  preimage?: string; // optional for lookup_invoice
  payment_hash: string;
  amount: number;
  fees_paid: number;
  created_at: string;
  expires_at?: string;
  settled_at?: string;
  metadata: Record<string, unknown>;
};

type MakeInvoiceResponse = NWCResponseBase<"make_invoice", InvoiceResult>;

type GetBalanceResponse = NWCResponseBase<"get_balance", { balance: number }>;

type LookupInvoiceRequest = {
  method: "lookup_invoice";
  params:
    | {
        invoice: string;
        payment_hash?: string;
      }
    | {
        payment_hash: string;
        invoice?: string;
      };
};

type LookupInvoiceResponse = NWCResponseBase<"lookup_invoice", InvoiceResult>;

// Union of all response types
export type NWCResponse =
  | PayInvoiceResponse
  | MakeInvoiceResponse
  | GetBalanceResponse
  | LookupInvoiceResponse;

// Request types
type PayInvoiceRequest = {
  method: "pay_invoice";
  params: {
    invoice: string;
    amount?: number;
  };
};

type MakeInvoiceRequest = {
  method: "make_invoice";
  params: {
    amount?: number;
    description?: string;
    description_hash?: string;
    expiry?: number;
  };
};

type GetBalanceRequest = {
  method: "get_balance";
  params: Record<string, never>;
};

export type NWCRequest =
  | PayInvoiceRequest
  | MakeInvoiceRequest
  | GetBalanceRequest
  | LookupInvoiceRequest;

export const payInvoiceCommand = "pay_invoice";
export const getBalanceCommand = "get_balance";
const NWC_ERROR_CODES = [
  "QUOTA_EXCEEDED",
  "INSUFFICIENT_BALANCE",
  "PAYMENT_FAILED",
  "OTHER",
];

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
  if (!query) return {};

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

  onUpdate?.("Success!");
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
    const decoded = decodeURIComponent(lud16);
    // lud16 is optional
    if (/^.+@.+\..+$/.test(decoded)) {
      result.lud16 = decoded;
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
  await cacheSettings({ enableNWC, nwcCommands: nwcCommands ?? [] }, pubkey);
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
    connectionPubkey: getPublicKey(hexToBytes(connectionSecret)),
  };
}

export async function getNwcBalance({
  userPubkey,
  walletPubkey,
  nwcRelay,
}: {
  userPubkey?: string;
  walletPubkey?: string;
  nwcRelay?: string;
}) {
  if (!userPubkey || !walletPubkey || !nwcRelay) {
    const errorResponse: NWCResponseBase<"get_balance", undefined> = {
      result_type: "get_balance",
      error: {
        code: "Error",
        message: "Missing NWC params",
      },
    };
    return errorResponse;
  }

  try {
    const { connectionSecret } = await getNwcConnection(userPubkey);

    const requestEvent = await makeNWCRequestEvent({
      walletPubkey,
      relay: nwcRelay,
      request: {
        method: getBalanceCommand,
        params: {},
      },
      connectionSecret,
    });

    if (!requestEvent) {
      throw new Error("Failed to send NWC get balance request");
    }

    // Because mutiny's relay is not readable
    const relay =
      nwcRelay === MUTINY_RELAY ? "wss://relay.wavlake.com" : nwcRelay;

    return fetchNWCResponse({
      userPubkey,
      requestEvent,
      relay,
    });
  } catch (error) {
    const errorResponse: NWCResponseBase<"get_balance", undefined> = {
      result_type: "get_balance",
      error: {
        code: "Error",
        message: (error as Error).message || "Unknown error occurred",
      },
    };
    return errorResponse;
  }
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
}) {
  const { connectionSecret } = await getNwcConnection(userPubkey);

  const requestEvent = await makeNWCRequestEvent({
    walletPubkey,
    relay: nwcRelay,
    request: {
      method: "pay_invoice",
      params: { invoice },
    },
    connectionSecret,
  });

  if (!requestEvent) {
    throw new Error("Failed to send NWC request");
  }

  const relay =
    nwcRelay === MUTINY_RELAY ? "wss://relay.wavlake.com" : nwcRelay;

  const response = await fetchNWCResponse({
    userPubkey,
    requestEvent,
    relay,
  });

  return response;
}

async function sendNwcMakeInvoiceRequest({
  userPubkey,
  amount,
  walletPubkey,
  nwcRelay,
}: {
  userPubkey: string;
  amount: number;
  walletPubkey: string;
  nwcRelay: string;
}) {
  const { connectionSecret } = await getNwcConnection(userPubkey);

  const requestEvent = await makeNWCRequestEvent({
    walletPubkey,
    relay: nwcRelay,
    request: {
      method: "make_invoice",
      params: {
        amount,
      },
    },
    connectionSecret,
  });
  if (!requestEvent) {
    throw new Error("Failed to send NWC request");
  }

  const relay =
    nwcRelay === MUTINY_RELAY ? "wss://relay.wavlake.com" : nwcRelay;

  const response = await fetchNWCResponse({
    userPubkey,
    requestEvent,
    relay,
  });

  return response;
}

async function fetchNWCResponse({
  userPubkey,
  relay,
  requestEvent,
}: {
  userPubkey: string;
  relay: string;
  requestEvent: Event;
}): Promise<NWCResponse> {
  const { connectionSecret, connectionPubkey } =
    await getNwcConnection(userPubkey);

  const [pTag, walletPubkey] =
    requestEvent.tags.find(([tag]) => tag === "p") ?? [];
  const filter = {
    kinds: [23195],
    "#p": [connectionPubkey],
    "#e": [requestEvent.id],
    authors: [walletPubkey],
  };

  return new Promise(async (resolve, reject) => {
    try {
      getEventFromRelay(relay, filter).then(async (responseEvent) => {
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
        resolve(response);
      });

      // NWC events dont get stored, so we need to subscribe before we publish
      setTimeout(() => publishEvent([relay], requestEvent), 1000);
    } catch (e) {
      reject(e);
    }
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
}) => {
  try {
    return sendNwcPaymentRequest({
      userPubkey,
      invoice,
      walletPubkey,
      nwcRelay,
    });
  } catch (error) {
    console.log("payWithNWC error", error);
    const errorResponse: NWCResponseBase<"pay_invoice", undefined> = {
      result_type: "pay_invoice",
      error: {
        code: "Error",
        message: (error as Error).message || "Unknown error occurred",
      },
    };

    return errorResponse;
  }
};

export const getNWCInvoice = async ({
  amount,
  userPubkey,
  walletPubkey,
  nwcRelay,
}: {
  amount: number;
  userPubkey: string;
  walletPubkey: string;
  nwcRelay: string;
}) => {
  try {
    return sendNwcMakeInvoiceRequest({
      amount,
      walletPubkey,
      userPubkey,
      nwcRelay,
    });
  } catch (error) {
    console.log("getNWCInvoice error", error);
    const errorResponse: NWCResponseBase<"make_invoice", undefined> = {
      result_type: "make_invoice",
      error: {
        code: "Error",
        message: (error as Error).message || "Unknown error occurred",
      },
    };

    return errorResponse;
  }
};

const WAIT_TIME_BETWEEN_CHECKS = 5000;
const DEFAULT_ATTEMPTS = 30;
// total time spent checking = 2.5 minutes
export const listenForIncomingNWCPayment = async ({
  userPubkey,
  invoice,
  walletPubkey,
  nwcRelay,
  signal,
}: {
  userPubkey: string;
  invoice: string;
  walletPubkey: string;
  nwcRelay: string;
  signal: AbortSignal;
}): Promise<any> => {
  const checkPayment = async (
    attempt: number = 1,
    maxAttempts: number = DEFAULT_ATTEMPTS,
  ): Promise<any> => {
    if (signal.aborted) {
      throw "Operation aborted. Invoice not yet paid.";
    }
    if (attempt > maxAttempts) {
      throw "Max attempts reached. Invoice not yet paid.";
    }

    const { connectionSecret } = await getNwcConnection(userPubkey);

    const requestEvent = await makeNWCRequestEvent({
      walletPubkey,
      relay: nwcRelay,
      request: {
        method: "lookup_invoice",
        params: {
          invoice,
        },
      },
      connectionSecret,
    });

    if (!requestEvent) {
      throw "Failed to send NWC request";
    }

    const relay =
      nwcRelay === MUTINY_RELAY ? "wss://relay.wavlake.com" : nwcRelay;

    const response = (await fetchNWCResponse({
      userPubkey,
      requestEvent,
      relay,
    })) as LookupInvoiceResponse;

    if (response.result?.settled_at) {
      return response;
    }

    // If not settled, wait and try again
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        resolve(checkPayment(attempt + 1, maxAttempts));
      }, WAIT_TIME_BETWEEN_CHECKS);
      // Set up a listener for the abort signal
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timeoutId);
          reject("Operation aborted. Invoice not yet paid.");
        },
        { once: true },
      );
    });
  };

  return checkPayment();
};
