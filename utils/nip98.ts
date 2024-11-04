// this is needed to polyfill TextDecoder which nostr-tools uses
import "fast-text-encoding";
// this is needed to polyfill crypto.getRandomValues which nostr-tools uses
import "react-native-get-random-values";

import { base64 } from "@scure/base";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import { utils } from "nostr-tools";
import { signEvent } from "./signing";

const HTTPAuth = 27235;

export const getAuthToken = async (
  loginUrl: string,
  httpMethod: string,
  includeAuthorizationScheme: boolean = false,
  payload?: Record<string, any>,
): Promise<string> => {
  const _authorizationScheme = "Nostr ";

  if (!loginUrl || !httpMethod)
    throw new Error("Missing loginUrl or httpMethod");

  const event = {
    kind: HTTPAuth,
    created_at: Math.round(new Date().getTime() / 1000),
    tags: [
      ["u", loginUrl],
      ["method", httpMethod],
    ],
    content: "",
  };

  if (payload) {
    const utf8Encoder = new TextEncoder();
    event.tags.push([
      "payload",
      bytesToHex(sha256(utf8Encoder.encode(JSON.stringify(payload)))),
    ]);
  }

  const signedEvent = await signEvent(event);
  const authorizationScheme = includeAuthorizationScheme
    ? _authorizationScheme
    : "";
  return (
    authorizationScheme +
    base64.encode(utils.utf8Encoder.encode(JSON.stringify(signedEvent)))
  );
};
