interface Wallet {
  displayName: string;
  uriPrefix: string;
  iosFallbackLink?: string;
}

export const WALLETS: Record<string, Wallet> = {
  default: {
    displayName: "Local default",
    uriPrefix: "lightning:",
  },
  walletofsatoshi: {
    displayName: "Wallet of Satoshi",
    uriPrefix: "walletofsatoshi:lightning:",
    iosFallbackLink:
      "https://apps.apple.com/us/app/wallet-of-satoshi/id1438599608",
  },
  strike: {
    displayName: "Strike",
    uriPrefix: "strike:lightning:",
    iosFallbackLink:
      "https://apps.apple.com/us/app/strike-bitcoin-payments/id1488724463",
  },
  cashapp: {
    displayName: "Cash App",
    uriPrefix: "https://cash.app/launch/lightning/",
    iosFallbackLink: "https://apps.apple.com/us/app/cash-app/id711923939",
  },
  zeusln: {
    displayName: "Zeus LN",
    uriPrefix: "zeusln:lightning:",
    iosFallbackLink: "https://apps.apple.com/us/app/zeus-ln/id1456038895",
  },
  zebedee: {
    displayName: "Zebedee",
    uriPrefix: "zebedee:lightning:",
    iosFallbackLink:
      "https://apps.apple.com/us/app/zebedee-wallet/id1484394401",
  },
  phoenix: {
    displayName: "Phoenix",
    uriPrefix: "phoenix://",
    iosFallbackLink:
      "https://apps.apple.com/us/app/phoenix-wallet/id1544097028",
  },
  breez: {
    displayName: "Breez",
    uriPrefix: "breez:",
    iosFallbackLink:
      "https://apps.apple.com/us/app/breez-lightning-client-pos/id1463604142",
  },
  blink: {
    displayName: "Blink (Bitcon Beach Wallet)",
    uriPrefix: "bitcoinbeach://",
    iosFallbackLink:
      "https://apps.apple.com/sv/app/bitcoin-beach-wallet/id1531383905",
  },
  blixtwallet: {
    displayName: "Blixt Wallet",
    uriPrefix: "blixtwallet:lightning:",
    iosFallbackLink: "https://testflight.apple.com/join/EXvGhRzS",
  },
  river: {
    displayName: "River",
    uriPrefix: "river://",
    iosFallbackLink:
      "https://apps.apple.com/us/app/river-buy-mine-bitcoin/id1536176542",
  },
  muun: {
    displayName: "Muun",
    uriPrefix: "muun:",
    iosFallbackLink: "https://apps.apple.com/us/app/muun-wallet/id1482037683",
  },
  bluewallet: {
    displayName: "Blue Wallet",
    uriPrefix: "bluewallet:lightning:",
    iosFallbackLink:
      "https://apps.apple.com/us/app/bluewallet-bitcoin-wallet/id1376878040",
  },
};
