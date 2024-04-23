import { Event } from "nostr-tools";

export const ShowEvents: Event[] = [
  {
    kind: 31923,
    content: "Event description here",
    created_at: 1713814392,
    tags: [
      ["d", "test-event-guid"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Flarge-artwork.png?alt=media&token=ed02d334-179d-4beb-a9c3-2c91479bd4f4",
      ],
      ["title", "Joe Martin, Ainsley Costello, Just Loud & Guests"],
      ["location", "Nashvile, TN"],
      // July 25, 2024 8pm CST
      ["start", "1721955600"],
      // July 25, 2024 10pm CST
      ["end", "1721962800"],
      // rsvp fee in sats
      ["fee", "1000"],
    ],
    pubkey: "58abd62e40e7ea1857e818205ab6cd54ae71e4115cab92775a8c0bc11e5f5e81",
    id: "test-event-id",
    sig: "3045022100f4",
  },
];
