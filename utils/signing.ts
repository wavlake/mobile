import { EventTemplate, finalizeEvent, generateSecretKey } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";
import { getSeckey } from "./secureStorage";
import { getIsLoggedInWithAmber } from "./cache";
import { signEventWithAmber } from "@/hooks";

export const signEvent = async (eventTemplate: EventTemplate) => {
  const loggedInWithAmber = await getIsLoggedInWithAmber();

  if (loggedInWithAmber) {
    return signEventWithAmber(eventTemplate);
  }

  return signEventWithStoredKey(eventTemplate);
};

const signEventWithStoredKey = async (eventTemplate: EventTemplate) => {
  const loggedInUserSeckey = await getSeckey();
  const anonSeckey = generateSecretKey();

  return finalizeEvent(
    eventTemplate,
    loggedInUserSeckey ? hexToBytes(loggedInUserSeckey) : anonSeckey,
  );
};
