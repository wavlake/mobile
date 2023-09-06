// this is needed to polyfill TextDecoder which nostr-tools uses
import "fast-text-encoding";

import { nip19 } from "nostr-tools";

export { getPublicKey } from "nostr-tools";

export const decodeNsec = (nsec: string) => {
  try {
    const { type, data } = nip19.decode(nsec);

    return type === "nsec" ? data : null;
  } catch {
    return null;
  }
};
