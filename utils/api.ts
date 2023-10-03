import axios from "axios";
import { getAuthToken, signEvent } from "@/utils/nostr";

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artist: string;
  artistUrl: string;
  avatarUrl: string;
  artworkUrl: string;
  albumId: string;
  albumTitle: string;
  liveUrl: string;
  duration: number;
  msatTotal?: number;
}

interface TrackResponse extends Track {
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

interface TrackComment {
  id: number;
  trackId: string;
  title: string;
  ownerId: string;
  content: string;
  createdAt: string;
  msatAmount: number;
  userId: string;
  commentMsatSum: number | null;
  name: string;
  commenterProfileUrl: string;
  commenterArtworkUrl: string;
}

interface Artist {
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
  topAlbums: Album[];
  topTracks: TrackResponse[];
  topMessages: TrackComment[];
}

interface Album {
  id: string;
  artistId: string;
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
}

interface Genre {
  id: number;
  name: string;
  count: number;
}

const baseURL = process.env.EXPO_PUBLIC_WAVLAKE_API_URL;
const apiClient = axios.create({
  baseURL,
});

const normalizeTrackResponse = (res: TrackResponse[]): Track[] => {
  return res.map((track) => ({
    id: track.id,
    title: track.title,
    artistId: track.artistId,
    artist: track.artist,
    artistUrl: track.artistUrl,
    avatarUrl: track.avatarUrl,
    artworkUrl: track.artworkUrl,
    albumId: track.albumId,
    albumTitle: track.albumTitle,
    liveUrl: track.liveUrl,
    duration: track.duration,
    msatTotal: track.msatTotal,
  }));
};

export const getNewMusic = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/tracks/new");

  return normalizeTrackResponse(data.data);
};

export const getTopMusic = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/charts/music/top");

  return normalizeTrackResponse(data.data);
};

export const getRandomMusic = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/tracks/random");

  return normalizeTrackResponse(data);
};

export const search = async (query: string): Promise<SearchResult[]> => {
  const { data } = await apiClient.get("/search", {
    params: {
      term: query,
    },
  });

  return data.data;
};

export const getAlbum = async (albumId: string): Promise<Album> => {
  const { data } = await apiClient.get(`/albums/${albumId}`);

  return data.data;
};

export const getAlbumTracks = async (albumId: string): Promise<Track[]> => {
  const { data } = await apiClient.get(`/tracks/${albumId}/album`);

  return normalizeTrackResponse(data.data);
};

export const getArtist = async (artistId: string): Promise<Artist> => {
  const { data } = await apiClient.get(`/artists/${artistId}`);

  return data.data;
};

export const getArtistAlbums = async (artistId: string): Promise<Album[]> => {
  const { data } = await apiClient.get(`/albums/${artistId}/artist`);

  return data.data;
};

export const getGenres = async (): Promise<Genre[]> => {
  const { data } = await apiClient.get("/meta/music/genres");

  return data.data.filter(({ count }: Genre) => count > 0);
};

export const getRandomGenreTracks = async (
  genreId: string,
): Promise<Track[]> => {
  const { data } = await apiClient.get(`/tracks/random/${genreId}/genre`);

  return normalizeTrackResponse(data);
};

const createAuthHeader = (
  relativeUrl: string,
  htttpMethod: "get" | "post" | "delete" = "get",
  payload?: Record<string, any>,
) => {
  const url = `${baseURL}${relativeUrl}`;

  return getAuthToken(url, htttpMethod, signEvent, true, payload);
};

export const getLibraryArtists = async () => {
  const url = "/library/artists";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  return data.data.artists;
};

export const getLibraryAlbums = async () => {
  const url = "/library/albums";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  return data.data.albums;
};

export const getLibraryTracks = async () => {
  const url = "/library/tracks";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  // TODO: need to normalize this response once the API includes all the data that is needed for tracks
  const tracks = data.data.tracks;

  const tracksMap: Map<string, Track> = new Map();

  tracks.forEach((track: Track) => {
    tracksMap.set(track.id, track);
  });

  return tracksMap;
};

export const addToLibrary = async (contentId: string) => {
  const url = "/library";
  const payload = { contentIds: [contentId] };
  const { data } = await apiClient.post(url, payload, {
    headers: {
      Authorization: await createAuthHeader(url, "post", payload),
      "Content-Type": "application/json",
    },
  });

  return data;
};

export const deleteFromLibrary = async (contentId: string) => {
  const url = `/library/${contentId}`;
  const { data } = await apiClient.delete(url, {
    headers: {
      Authorization: await createAuthHeader(url, "delete"),
    },
  });

  return data;
};
