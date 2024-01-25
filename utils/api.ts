import axios from "axios";
import { getAuthToken, signEvent } from "@/utils/nostr";

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

export interface ContentComment {
  id: number;
  contentId: string;
  title: string;
  content: string;
  createdAt: string;
  msatAmount: number;
  userId: string;
  name: string | null;
  commenterArtworkUrl: string | null;
  isNostr: boolean;
  replies: CommentReply[];
}

interface CommentReply {
  id: number;
  name: string | null;
  userId: string;
  artworkUrl: string | null;
  profileUrl: string | null;
  parentId: number;
  content: string;
  createdAt: string;
  msatAmount: number;
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
  topMessages?: Comment[];
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

// Function to normalize the response from the API
// TODO: Make responses from API consistent
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

export const getArtistComments = async (
  artistId: string,
  page: number,
  pageSize: number,
): Promise<ContentComment[]> => {
  const { data } = await apiClient.get(
    `/comments/artist/${artistId}/${page}/${pageSize}`,
  );

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

export const getLibraryArtists = async (): Promise<Artist[]> => {
  const url = "/library/artists";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  return data.data.artists;
};

export const getLibraryAlbums = async (): Promise<Album[]> => {
  const url = "/library/albums";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  return data.data.albums;
};

export const getLibraryTracks = async (): Promise<Track[]> => {
  const url = "/library/tracks";
  const { data } = await apiClient.get(url, {
    headers: {
      Authorization: await createAuthHeader(url),
    },
  });

  return normalizeTrackResponse(data.data.tracks);
};

export const addToLibrary = async (contentId: string) => {
  const url = "/library";
  const payload = { contentId };
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
