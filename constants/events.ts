import { Event } from "nostr-tools";

export const ShowEvents: Event[] = [
  {
    kind: 31923,
    content:
      "Wavalke and Tunestr present a special evening with artists, Joe Martin, Ainsley Costello, Just Loud, Death by Lions, The Higher Lowm and after hours LIVE karaoke by Satoshi Rockamoto. Doors open at 7pm, show starts at 7:30. This show is 21+.",
    created_at: 1713814392,
    tags: [
      ["d", "1"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Flarge-artwork.png?alt=media&token=ed02d334-179d-4beb-a9c3-2c91479bd4f4",
      ],
      ["title", "Joe Martin, Ainsley Costello, Just Loud & Guests"],
      ["location", "Vinyl Lab 1414 3rd Ave S, Nashvile, TN 37210"],
      // July 25, 2024 8pm CST
      ["start", "1721955600"],
      // July 25, 2024 10pm CST
      ["end", "1721962800"],
      // rsvp fee in sats
      ["fee", "1"],
      // replace with pubkeys of artists
      [
        "p",
        "npub19r9qrxmckj2vyk5a5ttyt966s5qu06vmzyczuh97wj8wtyluktxqymeukr",
        "artist",
      ],
      [
        "p",
        "npub13qrrw2h4z52m7jh0spefrwtysl4psfkfv6j4j672se5hkhvtyw7qu0almy",
        "artist",
      ],
      ["p", "JUSTLOUD", "artist"],
      ["p", "Death by Lions", "artist"],
      [
        "p",
        "npub1jp9s6r7fpuz0q09w7t9q0j3lmvd97gqzqzgps88gu870gulh24xs9xal58",
        "artist",
      ],
    ],
    pubkey: "1c2aa0fb7bf8ed94e0cdb1118bc1b8bd51c6bd3dbfb49b2fd93277b834c40397",
    id: "test-event-id",
    sig: "3045022100f4",
  },
];
