import axios from "axios";

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

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_WAVLAKE_API_URL,
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
