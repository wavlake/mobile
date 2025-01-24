export const WAVLAKE_RELAY = "wss://relay.wavlake.com";
export const DEFAULT_READ_RELAY_URIS = [
  WAVLAKE_RELAY,
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://relay.damus.io",
  "wss://nostr.wine",
  "wss://relay.snort.social",
  "wss://relay.fountain.fm",
];

export const DEFAULT_WRITE_RELAY_URIS = [
  "wss://purplepag.es",
  "wss://relay.nostr.band",
  "wss://relay.damus.io",
  WAVLAKE_RELAY,
];

// this npub published zap receipts and label events
export const wavlakeFeedPubkey =
  process.env.EXPO_PUBLIC_WAVLAKE_FEED_PUBKEY ?? "";
// this npub is used by the NWC wallet service
export const walletServicePubkey =
  process.env.EXPO_PUBLIC_WALLET_SERVICE_PUBKEY ?? "";
