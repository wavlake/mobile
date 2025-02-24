// LUD16
// https://github.com/lnurl/luds/blob/luds/16.md

interface LNURLPayResponse {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  tag: string;
}

// Get the initial LNURL endpoint from lud16 address
export const getLNURLEndpointFromLUD16 = (lud16: string): string => {
  // Validate basic format, e.g. user@wavlake.com
  const lud16Regex = /^[a-z0-9-_.]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  if (!lud16Regex.test(lud16)) {
    throw new Error("Invalid lud16 format");
  }

  const [username, domain] = lud16.split("@");

  // Check if domain is .onion (Tor hidden service)
  const isOnion = domain.endsWith(".onion");
  const protocol = isOnion ? "http://" : "https://";

  return `${protocol}${domain}/.well-known/lnurlp/${username}`;
};

// Fetch the LNURL-pay metadata and get callback URL
export const fetchLNURLPaymentInfo = async (
  lud16: string,
): Promise<{
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
}> => {
  const endpoint = getLNURLEndpointFromLUD16(lud16);

  try {
    const response = await fetch(endpoint);
    const data: LNURLPayResponse = await response.json();

    if ("status" in data && data.status === "ERROR") {
      throw new Error("Failed to fetch LNURL payment info");
    }

    if (data.tag !== "payRequest") {
      throw new Error("Invalid LNURL-pay response");
    }

    return {
      callback: data.callback,
      maxSendable: data.maxSendable,
      minSendable: data.minSendable,
      metadata: data.metadata,
    };
  } catch (error) {
    throw new Error(`LNURL-pay fetch failed: ${error}`);
  }
};

// Validate payment amount against LNURL constraints
export const validateLNURLPayAmount = (
  amountMsats: number,
  minSendable: number,
  maxSendable: number,
): boolean => {
  return amountMsats >= minSendable && amountMsats <= maxSendable;
};
