import { EventTemplate, finalizeEvent, generateSecretKey } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";
import { getSeckey } from "./secureStorage";
import { getAmberPubkey } from "./cache";
import { signEventWithAmber } from "@/hooks";

// TODO: save events to react-query cache (skip HTTP auth events, kind 27235)
export const signEvent = async (eventTemplate: EventTemplate) => {
  const amberPubkey = await getAmberPubkey();
  const loggedInWithAmber = amberPubkey && amberPubkey !== "";

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
