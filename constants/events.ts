import { Event, UnsignedEvent } from "nostr-tools";

const CD_AD =
  "\n\nEach Wavlake ticket includes a free signed CD, available for pickup at the merch table on the night of the show.";
export const WAVLAKE_AD = [
  "\n\nVisit the Wavlake app to purchase tickets. Limited availability.",
];
export const ShowEvents: UnsignedEvent[] = [
  {
    pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
    created_at: 1713818000,
    kind: 31923,
    content: `21+ Event, $15 USD Tickets, Doors 7PM${CD_AD}${WAVLAKE_AD}`,
    tags: [
      ["title", "Seattle, WA (Barboza)"],
      ["summary", "May 2, 2025 - Seattle, WA (Barboza)"],
      ["start", "1746237600"],
      ["end", "1746252000"],
      ["start_tzid", "America/Los_Angeles"],
      ["location_short", "Seattle, WA"],
      ["location_link", "https://maps.app.goo.gl/VTcgPXjgGUi6fqvJA"],
      ["location", "925 E Pike St, Seattle, WA 98122"],
      ["t", "concert"],
      ["price", "15", "USD"],
      ["g", "c23nbecd"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-tickets.png?alt=media&token=4b3683b8-2755-4453-918b-a4c7f4232b3f",
      ],
    ],
  },
  {
    pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
    created_at: 1713818000,
    kind: 31923,
    content: `All Ages, $21.25 USD Tickets, Doors 6:30PM${CD_AD}${WAVLAKE_AD}`,
    tags: [
      ["title", "Los Angeles, CA (Moroccan Lounge)"],
      ["summary", "May 4, 2025 - Los Angeles, CA (Moroccan Lounge)"],
      ["start", "1746409800"],
      ["end", "1746424200"],
      ["start_tzid", "America/Los_Angeles"],
      ["location_short", "Los Angeles, CA"],
      ["location_link", "https://maps.app.goo.gl/hjXBboMXFfGmfGfJA"],
      ["location", "901 E 1st St, Los Angeles, CA 90012"],
      ["t", "concert"],
      ["price", "21.25", "USD"],
      ["g", "9q5ctw2g"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-tickets.png?alt=media&token=4b3683b8-2755-4453-918b-a4c7f4232b3f",
      ],
    ],
  },
  {
    pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
    created_at: 1713818000,
    kind: 31923,
    content: `16+ Event, £17 or $29.81 USD Tickets, Doors 7PM${CD_AD}${WAVLAKE_AD}`,
    tags: [
      ["title", "Brooklyn, NY (Elsewhere)"],
      ["summary", "May 11, 2025 - Brooklyn, NY (Elsewhere)"],
      ["start", "1746985200"],
      ["end", "1746999600"],
      ["start_tzid", "America/New_York"],
      ["location_short", "Brooklyn, NY"],
      ["location_link", "https://maps.app.goo.gl/EtWShkrX4VQdeQgR7"],
      ["location", "599 Johnson Ave, Brooklyn, NY 11237"],
      ["t", "concert"],
      ["price", "29.81", "USD"],
      ["g", "dr5rtffv"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-tickets.png?alt=media&token=4b3683b8-2755-4453-918b-a4c7f4232b3f",
      ],
    ],
  },
  {
    pubkey: "7759fb14ce9324de4c450d42dbbbd011d3540b49ce91a76912a27738f9a97be4",
    created_at: 1713818000,
    kind: 31923,
    content: `14+ Event, £17 or $21.40 USD Tickets, Doors 7PM${CD_AD}${WAVLAKE_AD}`,
    tags: [
      ["title", "London, England (The Grace)"],
      ["summary", "October 17, 2025 - London, England (The Grace)"],
      ["start", "1760685600"],
      ["end", "1760700000"],
      ["start_tzid", "Europe/London"],
      ["location_short", "London, England"],
      ["location_link", "https://maps.app.goo.gl/FJLP6tHR6xuDMmmf8"],
      ["location", "20-22 Highbury Corner, London N5 1RD, UK"],
      ["t", "concert"],
      ["price", "21.4", "USD"],
      ["g", "gcpvjxu1"],
      [
        "image",
        "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Follie-tickets.png?alt=media&token=4b3683b8-2755-4453-918b-a4c7f4232b3f",
      ],
    ],
  },
];

const exampleEvents = [
  {
    id: "b2c379a3e49d9020a24809ce47fa068ed492f6eb9e859d2a50be2f0d612d7bfd",
    pubkey: "146bda4ec6932830503ee4f8e8b626bd7b3a5784232b8240ba15c8cbff9a07cd",
    created_at: 1737700836,
    kind: 31923,
    tags: [
      [
        "a",
        "37515:a19aadee53bc71d25afef365067a3978ac30d5520d36ec8cc74d77a872af7359:chiang-mai-w5q6uk",
      ],
      ["d", "34e5b3e4-1386-4e22-8731-134a99af7063"],
      ["t", "meetup"],
      ["r", ""],
      ["title", "Sats'n'Facts Pre-drinkup at Chithole"],
      [
        "image",
        "https://cdn.satlantis.io/npub1z34a5nkxjv5rq5p7unuw3d3xh4an54uyyv4cys96zhyvhlu6qlxs4qnh9r-1737700763968-Screenshot%202025-01-24%20at%2013.39.11.png",
      ],
      ["start", "1741257000"],
      ["end", "1741264200"],
      ["start_tzid", "Asia/Bangkok"],
      ["g", "w5q6un4kn"],
      [
        "location",
        "Chit Hole CNX -THAI CRAFT BEER 5 Nimmana Haeminda Rd Lane 1, Tambon Su Thep, Amphoe Mueang Chiang Mai, Chang Wat Chiang Mai 50200, Thailand",
      ],
      [
        "summary",
        "I'm not going to Sats'n'facts due to other obligations in Chiang Mai but if anyone wants to grab some craft beers at Chit Hole I'm down for that.\n\nTime to be set before the \"Bitcoin\" meetup - which is not just Bitcoin.",
      ],
      ["url", ""],
    ],
    content:
      "I'm not going to Sats'n'facts due to other obligations in Chiang Mai but if anyone wants to grab some craft beers at Chit Hole I'm down for that.\n\nTime to be set before the \"Bitcoin\" meetup - which is not just Bitcoin.",
    sig: "bc84d69e83d308f87c3da9b128be2bab11db0dd543bd9b44448b764f1dc5d4aec7fc17645d996d67354bd3e59030c8b633c4af65925340112a7434e7cf2a270c",
  },
  {
    id: "aa6e1cba57ed992389a822966041305d4f016d20130aac1e8fefb13f80ab121e",
    pubkey: "df57b4986a2c659965c3df95ca3fea3533a207b09bf2c55a70d406c7d049124f",
    created_at: 1737613020,
    kind: 31923,
    tags: [
      ["d", "938e28b0"],
      ["title", "Bitcoin Meetup 比特幣聚會"],
      [
        "description",
        "Free Event\n\nIFC P4 rooftop garden outside Shake Shack\n\nMeetup Link: https://www.meetup.com/bitcoin-hk/events/305606213/\n\nThe SVG file for the updated logo is here: https://artifaq.io/artwork/bitcoinhk-logo",
      ],
      ["start", "1739446200"],
      ["end", "1739455200"],
      ["start_tzid", "Asia/Hong_Kong"],
      [
        "p",
        "df57b4986a2c659965c3df95ca3fea3533a207b09bf2c55a70d406c7d049124f",
        "",
        "host",
      ],
      [
        "location",
        "IFC Rooftop Garden, IFC Rooftop Garden, Two International Finance Centre, Finance St, Central, Hong Kong",
        "IFC Rooftop Garden",
        "IFC Rooftop Garden, Two International Finance Centre, Finance St, Central, Hong Kong",
      ],
      [
        "address",
        "IFC Rooftop Garden, IFC Rooftop Garden, Two International Finance Centre, Finance St, Central, Hong Kong",
        "IFC Rooftop Garden",
        "IFC Rooftop Garden, Two International Finance Centre, Finance St, Central, Hong Kong",
      ],
      ["g", "wecnv9p2"],
      [
        "image",
        "https://flockstr.s3.amazonaws.com/event/PHPA3ZtWsYneQMWvh9-zw",
      ],
    ],
    content:
      "Free Event\n\nIFC P4 rooftop garden outside Shake Shack\n\nMeetup Link: https://www.meetup.com/bitcoin-hk/events/305606213/\n\nThe SVG file for the updated logo is here: https://artifaq.io/artwork/bitcoinhk-logo",
    sig: "66ba6ddc7e80cc03d9f6078a559cd86e1bf8df03b58ca5bf3be6e121efb10b3031d302d0498873fb924fcb8946eed61495d34460d27de080b22098343128a7a2",
  },
];
