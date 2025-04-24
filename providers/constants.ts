import { Filter, Event } from "nostr-tools";

export const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
export const SOCIAL_NOTES: Filter = {
  kinds: [
    // comment
    1,
    // repost
    6,
    // reaction
    7,
    // zap receipt
    9735,
  ],
  limit: 100,
};

export const FOLLOWS_SOCIAL_NOTES: Filter = {
  kinds: [
    // comment
    1,
    // repost
    6,
  ],
  limit: 52,
};

export const RECENT_COMMENT_ACTIVITY: Filter = {
  kinds: [
    // repost
    6,
    // reaction
    7,
    // zap receipt
    9735,
  ],
  limit: 53,
};

export const PUBKEY_METADATA: Filter = {
  kinds: [0],
};

export const FOLLOWS_FILTER: Filter = {
  kinds: [
    // Follows
    3,
    // mute list
    10000,
    // user emoji list
    10030,
  ],
};

export type NostrEventContextType = {
  getLatestEvent: (filter: Filter, relays?: string[]) => Promise<Event | null>;
  querySync: (filter: Filter, relays?: string[]) => Promise<Event[]>;
  getEventFromId: (id: string, relays?: string[]) => Promise<Event | null>;
  cacheEventById: (event: Event) => void;
  cacheEventsById: (events: Event[]) => void;
  getEventRelatedEvents: (event: Event, since?: number) => Promise<Event[]>;
  publishEvent: (event: Event) => Promise<void>;
};

export const defaultNostrEventContext: Partial<NostrEventContextType> = {};

// [cache data type (nostr), data format, event type, related id or pubkey]
export const nostrQueryKeys = {
  userTickets: (pubkey: string, ticketBotPubkey: string) => [
    "nostr",
    "event-list",
    "userTickets",
    pubkey,
    ticketBotPubkey,
  ],
  ticketedEvents: (ticketBotPubkey: string) => [
    "nostr",
    "event-list",
    "ticketedEvents",
    ticketBotPubkey,
  ],
  ticketZapReceipts: (pubkey: string) => [
    "nostr",
    "event-list",
    "ticketZapReceipts",
    pubkey,
  ],
  event: (id: string) => ["nostr", "event", "eventById", id],
  profile: (pubkey: string) => ["nostr", "event", "pubkey profile", pubkey],
  relayList: (pubkey: string) => ["nostr", "event", "pubkey relayList", pubkey],
  // TODO - clean up old follows hooks (add, remove, get)
  // kind 3 for logged in user
  follows: (pubkey: string | null | undefined) => [
    "nostr",
    "event",
    "follows",
    pubkey,
  ],
  // events with user pubkey #p tag
  pTagEvents: (pubkey: string) => [
    "nostr",
    "event-list",
    "pTag-kind-1",
    pubkey,
  ],
  // any kind with event #e tag that references the eventId (replies, reposts, reactions, etc)
  eTagEvents: (eventId: string) => ["nostr", "event-list", "eTag", eventId],
  // kind 1 with content #i tag
  iTagComments: (contentId: string) => [
    "nostr",
    "event-list",
    "contentId-iTagEvents",
    contentId,
  ],
  pubkeyITagComments: (pubkey: string) => [
    "nostr",
    "event-list",
    "pubkey-content-owned-iTag",
    pubkey,
  ],
  // kind 1 with event #e tag
  eTagReplies: (eventId: string) => [
    "nostr",
    "event-list",
    "replies-eTag-kind-1",
    eventId,
  ],
};
