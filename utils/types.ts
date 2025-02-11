// response.data should have this shape
export interface ResponseObject<T = any> {
  error?: string;
  success: boolean;
  data: T;
}
export interface Track {
  id: string;
  title: string;
  artistId: string;
  artist: string;
  artistUrl?: string;
  avatarUrl: string;
  artworkUrl: string;
  albumId: string;
  albumTitle: string;
  liveUrl: string;
  duration: number;
  msatTotal?: number;
  msatTotal30Days?: number;
  podcast?: Podcast;
  podcastUrl?: string;
  podcastId?: string;
  hasPromo?: boolean;
  colorInfo?: {
    darkMuted: string;
    darkVibrant: string;
    lightMuted: string;
    lightVibrant: string;
    muted: string;
    vibrant: string;
  };
  genre?: {
    id: number;
    name: string;
  };
}
export interface Episode {
  id: string;
  title: string;
  description?: string;
  order: number;
  playCount?: number;
  createdAt: string;
  publishedAt: string;
  liveUrl: string;
  duration: number;
  podcastId: string;
  podcast: Podcast | string;
  podcastUrl: string;
  artworkUrl: string;
}

export interface Podcast {
  id: string;
  name: string;
  description?: string;
  artworkUrl: string;
  podcastUrl: string;
}

export interface TrackResponse extends Track {
  [key: string]: unknown;
}

export interface SearchResult {
  id: string;
  type: "artist" | "album" | "track";
  name: string;
  avatarUrl: string;
  artworkUrl?: string;
  liveUrl?: string;
  duration?: number;
  albumId?: string;
  albumTitle?: string;
  artistId?: string;
  artist?: string;
}

export interface ContentComment {
  id: number;
  contentId: string;
  title: string;
  content?: string;
  createdAt: string;
  msatAmount: number;
  userId: string;
  name: string | null;
  commenterArtworkUrl: string | null;
  artworkUrl: string | null;
  isNostr: boolean;
  // this houses legacy comment replies that have no nostr event ids
  replies: ContentComment[];
  // kind 1 event id
  // may not exist, depends on user's preference
  eventId?: string;
  // zap receipt event id
  zapEventId?: string;
}

export interface Artist {
  id: string;
  userId: string;
  name: string;
  artworkUrl: string;
  artistUrl: string;
  createdAt: string;
  updatedAt: string;
  bio: string;
  twitter: string | null;
  instagram: string | null;
  youtube: string | null;
  website: string | null;
  deleted: boolean;
  verified: boolean;
  npub: string | null;
  topAlbums?: Album[];
  topTracks?: TrackResponse[];
  topMessages?: ContentComment[];
}

export interface Album {
  id: string;
  artistId: string;
  artist?: string;
  title: string;
  artworkUrl: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  deleted: boolean;
  genreId: number | null;
  subgenreId: number | null;
  isDraft: boolean;
  publishedAt: string;
  topMessages?: ContentComment[];
}
export interface Playlist {
  id: string;
  userId: string;
  title: string;
  isFavorites: boolean;
  createdAt: string;
  updatedAt: string;
  tracks: Pick<Track, "artworkUrl" | "id" | "duration" | "title" | "artist">[];
}

export interface Genre {
  id: number;
  name: string;
  count: number;
}

export interface NostrProfileData {
  publicHex: string;
  metadata: {
    name: string;
    npub: string;
    about?: string;
    lud16?: string;
    nip05?: string;
    banner?: string;
    pubkey: string;
    picture?: string;
    created_at: number;
    nip05valid?: boolean;
    display_name?: string;
    displayName?: string;
    username?: string;
  } & NostrUserProfile;
  followerCount: number;
  follows: { pubkey: string; relay?: string; petname?: string }[];
}
export interface PrivateUserData {
  id: string;
  name: string;
  msatBalance: string;
  ampMsat: number;
  artworkUrl?: string;
  profileUrl: string;
  isLocked: boolean;
  userFavoritesId: string;
  userFavorites: string[];
  emailVerified: boolean;
  isRegionVerified: boolean;
  providerId: string;
  lightningAddress?: string;
  nostrProfileData: NostrProfileData[];
}

export interface NostrUserProfile {
  name?: string;
  banner?: string;
  about?: string;
  website?: string;
  lud16?: string;
  nip05?: string;
  picture?: string;
  // non standard fields below
  displayName?: string;
  display_name?: string;
  bio?: string;
  lud06?: string;
  zapService?: string;
  publicHex?: string;
}
