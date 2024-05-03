import { Event } from "nostr-tools";

export const ShowEvents: Event[] = [
  {
    kind: 31923,
    content: `Wavlake and Tunestr present a special evening at The Vinyl Lounge in Nashville with Joe Martin, Ainsley Costello, Just Loud, and more. Stick around after hours for live karaoke by the Satoshi Rockamoto all-stars playing their favorite songs where you can join in, too!

All RSVPs booked through the Wavlake app come with a special gift at the door. 1 sat minimum to RSVP but we encourage everyone to give more as all proceeds will go to the featured performers.
      
Doors open at 7pm, show starts at 7:30pm. This show is 21+.`,
    created_at: 1713814392,
    tags: [
      ["d", "1"],
      [
        "image",
        "https://d12wklypp119aj.cloudfront.net/image/375bccc5-7e8c-4579-a6c5-1feb34b11ddc.png",
      ],
      ["title", "Joe Martin, Ainsley Costello, Just Loud & Guests"],
      ["location", "Vinyl Lounge 1414 3rd Ave S, Nashvile, TN 37210"],
      ["location_short", "Nashvile, TN"],
      ["location_link", "https://maps.app.goo.gl/Rmy1aL2snpENwJZ68"],
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
    // the ticket DMs will be sent by this pubkeys, and the mobile app will only listen for DMs from this pubkey
    pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
    // pubkey: "1c2aa0fb7bf8ed94e0cdb1118bc1b8bd51c6bd3dbfb49b2fd93277b834c40397",
    id: "test-event-id",
    sig: "3045022100f4",
  },
];
