import { NostrUserProfile } from "@/utils";
import { Filter, Event } from "nostr-tools";

export const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
export const SOCIAL_NOTES: Filter = {
  kinds: [
    // comment
    1,
    // repost
    6,
    // generic repost
    16,
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
    // generic repost
    16,
  ],
  limit: 52,
};

export const RECENT_COMMENT_ACTIVITY: Filter = {
  kinds: [
    // repost
    6,
    // generic repost
    16,
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
  getEventRelatedEvents: (event: Event) => Promise<Event[]>;
  comments: Event[];
  reactions: Event[];
  reposts: Event[];
  genericReposts: Event[];
  zapReceipts: Event[];
  follows: string[];
  followsActivity: string[];
  // Record<followPubkey, followRelay>
  followsMap: Record<string, string>;
  loadInitialData: () => Promise<void>;
  isLoadingInitial: boolean;
};

export const defaultNostrEventContext: Partial<NostrEventContextType> = {
  comments: [],
  reactions: [],
  reposts: [],
  genericReposts: [],
  zapReceipts: [],
  follows: [],
  followsActivity: [],
  followsMap: {},
};

export const nostrQueryKeys = {
  event: (id: string) => ["nostr", "event", id],
  profile: (pubkey: string) => ["nostr", "profile", "event", pubkey],
  relayList: (pubkey: string) => ["nostr", "relayList", "event", pubkey],
  // TODO - clean up old follows hooks (add, remove, get)
  follows: (pubkey: string | null | undefined) => [
    "nostr",
    "follows",
    "event",
    pubkey,
  ],
  // kind 1 with user pubkey #p tag
  pTagComments: (pubkey: string) => ["nostr", "kind-1", "event-list", pubkey],
  // kind 6 with user pubkey #p tag
  pTagReposts: (pubkey: string) => ["nostr", "kind-6", "event-list", pubkey],
  // kind 7 with user pubkey #p tag
  pTagReactions: (pubkey: string) => ["nostr", "kind-7", "event-list", pubkey],
  // kind 16 with user pubkey #p tag
  pTagGenericReposts: (pubkey: string) => [
    "nostr",
    "kind-16",
    "event-list",
    pubkey,
  ],
  // kind 9735 with user pubkey #p tag
  pTagZapReceipts: (pubkey: string) => [
    "nostr",
    "kind-9735",
    "event-list",
    pubkey,
  ],
  // any kind with event #e tag that references the eventId (replies, reposts, reactions, etc)
  eTagEvents: (eventId: string) => [
    "nostr",
    "eTagEvents",
    "event-list",
    eventId,
  ],
  // kind 1 with content #i tag
  iTagComments: (contentId: string) => [
    "nostr",
    "iTag",
    "event-list",
    contentId,
  ],
  // kind 1 with event #e tag
  eTagReplies: (eventId: string) => ["nostr", "replies", "event-list", eventId],
};

export function getQueryKeyForKind(kind: number, pubkey: string) {
  switch (kind) {
    case 1:
      return nostrQueryKeys.pTagComments(pubkey);
    case 6:
      return nostrQueryKeys.pTagReposts(pubkey);
    case 7:
      return nostrQueryKeys.pTagReactions(pubkey);
    case 16:
      return nostrQueryKeys.pTagGenericReposts(pubkey);
    case 9735:
      return nostrQueryKeys.pTagZapReceipts(pubkey);
  }
}
