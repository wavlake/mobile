export interface NostrUserProfile {
  name?: string;
  banner?: string;
  about?: string;
  website?: string;
  lud16?: string;
  nip05?: string;
  picture?: string;
  // non standard fields below
  [key: string]: string | undefined; // allows custom fields
  displayName?: string;
  bio?: string;
  lud06?: string;
  zapService?: string;
  publicHex?: string;
}

export const DEFAULT_READ_RELAY_URIS = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://relay.damus.io",
  "wss://nostr.wine",
  "wss://relay.snort.social",
  "wss://relay.wavlake.com",
  "wss://relay.fountain.fm",
];

export const DEFAULT_WRITE_RELAY_URIS = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://relay.damus.io",
  "wss://relay.wavlake.com",
  "wss://nostr.mutinywallet.com",
];

// this npub published zap receipts and label events
export const wavlakeFeedPubkey =
  process.env.EXPO_PUBLIC_WAVLAKE_FEED_PUBKEY ?? "";
// this npub is used by the NWC wallet service
export const walletServicePubkey =
  process.env.EXPO_PUBLIC_WALLET_SERVICE_PUBKEY ?? "";
