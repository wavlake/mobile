import { Event } from "nostr-tools";

export const ShowEvents: Event[] = [
  {
    pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
    created_at: 1713818000,
    kind: 31923,
    id: "test-event-id-4",
    sig: "3045022100f4",
    content: "21+ Event, $15 USD Tickets, Doors 7PM",
    tags: [
      ["d", "4"],
      ["title", "Seattle, WA (Barboza)"],
      ["summary", "May 2, 2025 - Seattle, WA (Barboza)"],
      ["start", "2025-05-03T02:00:00.000Z"],
      ["location_short", "Seattle, WA"],
      ["location_link", "https://maps.app.goo.gl/VTcgPXjgGUi6fqvJA"],
      ["location", "925 E Pike St, Seattle, WA 98122"],
      ["t", "concert"],
      ["price", "15", "USD"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-cropped.jpg?alt=media&token=0e44c6fb-b810-4503-9f77-f574b1501cf8",
      ],
    ],
  },
  {
    pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
    created_at: 1713818000,
    kind: 31923,
    id: "test-event-id-5",
    sig: "3045022100f5",
    content: "All Ages, $21.25 USD Tickets, Doors 6:30PM",
    tags: [
      ["d", "5"],
      ["title", "Los Angeles, CA (Moroccan Lounge)"],
      ["summary", "May 4, 2025 - Los Angeles, CA (Moroccan Lounge)"],
      ["start", "2025-05-05T01:30:00.000Z"],
      ["location_short", "Los Angeles, CA"],
      ["location_link", "https://maps.app.goo.gl/hjXBboMXFfGmfGfJA"],
      ["location", "901 E 1st St, Los Angeles, CA 90012"],
      ["t", "concert"],
      ["price", "21.25", "USD"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-cropped.jpg?alt=media&token=0e44c6fb-b810-4503-9f77-f574b1501cf8",
      ],
    ],
  },
  {
    pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
    created_at: 1713818000,
    kind: 31923,
    id: "test-event-id-2",
    sig: "3045022100f2",
    content: "16+ Event, £17 or $29.81 USD Tickets, Doors 7PM",
    tags: [
      ["d", "2"],
      ["title", "Brooklyn, NY (Elsewhere)"],
      ["summary", "May 11, 2025 - Brooklyn, NY (Elsewhere)"],
      ["start", "2025-05-11T23:00:00.000Z"],
      ["location_short", "Brooklyn, NY"],
      ["location_link", "https://maps.app.goo.gl/EtWShkrX4VQdeQgR7"],
      ["location", "599 Johnson Ave, Brooklyn, NY 11237"],
      ["t", "concert"],
      ["price", "29.81", "USD"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-cropped.jpg?alt=media&token=0e44c6fb-b810-4503-9f77-f574b1501cf8",
      ],
    ],
  },
  {
    pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
    created_at: 1713818000,
    kind: 31923,
    id: "test-event-id-3",
    sig: "3045022100f3",
    content: "14+ Event, £17 or $21.40 USD Tickets, Doors 7PM",
    tags: [
      ["d", "3"],
      ["title", "London, England (The Grace)"],
      ["summary", "October 17, 2025 - London, England (The Grace)"],
      ["start", "2025-10-17T18:00:00.000Z"],
      ["location_short", "London, England"],
      ["location_link", "https://maps.app.goo.gl/FJLP6tHR6xuDMmmf8"],
      ["location", "20-22 Highbury Corner, London N5 1RD, UK"],
      ["t", "concert"],
      ["price", "21.4", "USD"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-cropped.jpg?alt=media&token=0e44c6fb-b810-4503-9f77-f574b1501cf8",
      ],
    ],
  },
];
// Past Events
// [
//   {
//     kind: 31923,
//     content: `Wavlake and Tunestr present a special evening at The Vinyl Lounge in Nashville with Joe Martin, Ainsley Costello, Just Loud, and more. Stick around after hours for live karaoke by the Satoshi Rockamoto all-stars playing their favorite songs where you can join in, too!

// RSVPs booked through the Wavlake app come with a special gift at the door, while supplies last. 1 sat minimum to RSVP but we encourage everyone to give more as all proceeds will go to the featured performers.

// Doors open at 7pm, show starts at 7:30pm. This show is 21+.`,
//     created_at: 1713814392,
//     tags: [
//       ["d", "1"],
//       [
//         "image",
//         "https://d12wklypp119aj.cloudfront.net/image/375bccc5-7e8c-4579-a6c5-1feb34b11ddc.png",
//       ],
//       ["title", "Joe Martin, Ainsley Costello, Just Loud & Guests"],
//       ["location", "Vinyl Lounge 1414 3rd Ave S, Nashvile, TN 37210"],
//       ["location_short", "Nashvile, TN"],
//       ["location_link", "https://maps.app.goo.gl/Rmy1aL2snpENwJZ68"],
//       // July 25, 2024 8pm CST
//       ["start", "1721955600"],
//       // July 25, 2024 10pm CST
//       ["end", "1721962800"],
//       // rsvp fee in sats
//       ["price", "50", "USD"]
//       // replace with pubkeys of artists
//       [
//         "p",
//         "npub19r9qrxmckj2vyk5a5ttyt966s5qu06vmzyczuh97wj8wtyluktxqymeukr",
//         "artist",
//       ],
//       [
//         "p",
//         "npub13qrrw2h4z52m7jh0spefrwtysl4psfkfv6j4j672se5hkhvtyw7qu0almy",
//         "artist",
//       ],
//       ["p", "JUSTLOUD", "artist"],
//       [
//         "p",
//         "npub1jp9s6r7fpuz0q09w7t9q0j3lmvd97gqzqzgps88gu870gulh24xs9xal58",
//         "artist",
//       ],
//     ],
//     // the ticket DMs will be sent by this pubkeys, and the mobile app will only listen for DMs from this pubkey
//     pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
//     // pubkey: "1c2aa0fb7bf8ed94e0cdb1118bc1b8bd51c6bd3dbfb49b2fd93277b834c40397",
//     id: "test-event-id",
//     sig: "3045022100f4",
//   },
// ];
