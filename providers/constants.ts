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
  querySync: (filter: Filter) => Promise<Event[]>;
  getEventAsync: (id: string) => Promise<Event | null>;
  cacheEventById: (event: Event) => void;
  cacheEventsById: (events: Event[]) => void;
  getPubkeyProfile: (pubkey: string) => Promise<NostrUserProfile | null>;
  batchGetPubkeyProfiles: (
    pubkeys: string[],
  ) => Promise<Map<string, NostrUserProfile>>;
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
  comments: (pubkey: string) => ["nostr", "kind1", pubkey],
  // kind 6 with user pubkey #p tag
  reposts: (pubkey: string) => ["nostr", "kind6", pubkey],
  // kind 7 with user pubkey #p tag
  reactions: (pubkey: string) => ["nostr", "kind7", pubkey],
  // kind 16 with user pubkey #p tag
  genericReposts: (pubkey: string) => ["nostr", "kind16", pubkey],
  // kind 9735 with user pubkey #p tag
  zapReceipts: (pubkey: string) => ["nostr", "kind9735", pubkey],
  // any kind with event #e tag that references the eventId (replies, reposts, reactions, etc)
  eventRelatedEvents: (eventId: string) => [
    "nostr",
    "eventRelatedEvents",
    eventId,
  ],
  contentComments: (contentId: string) => [
    "nostr",
    "content-comments",
    contentId,
  ],
  // kind 1 with event #e tag
  replies: (eventId: string) => ["nostr", "replies", eventId],
};

export function getQueryKeyForKind(kind: number, pubkey: string) {
  switch (kind) {
    case 1:
      return nostrQueryKeys.comments(pubkey);
    case 6:
      return nostrQueryKeys.reposts(pubkey);
    case 7:
      return nostrQueryKeys.reactions(pubkey);
    case 16:
      return nostrQueryKeys.genericReposts(pubkey);
    case 9735:
      return nostrQueryKeys.zapReceipts(pubkey);
  }
}
