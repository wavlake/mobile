import { EventTemplate, finalizeEvent, generateSecretKey } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";
import { getSeckey } from "./secureStorage";

export const signEvent = async (eventTemplate: EventTemplate) => {
  const loggedInUserSeckey = await getSeckey();
  const anonSeckey = generateSecretKey();

  return finalizeEvent(
    eventTemplate,
    loggedInUserSeckey ? hexToBytes(loggedInUserSeckey) : anonSeckey,
  );
};
