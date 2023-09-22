import axios from "axios";

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistUrl: string;
  avatarUrl: string;
  artworkUrl: string;
  msatTotal30Days: string;
  msatTotal7Days: string;
  msatTotal1Days: string | null;
  albumTitle: string;
  liveUrl: string;
  duration: number;
  createdAt: string;
  albumId: string;
  artistId: string;
  order: number;
  isProcessing: boolean;
}

export interface SearchResult {
  id: string;
  type: "artist" | "album" | "track";
  name: string;
  artworkUrl: string;
  liveUrl?: string;
  duration?: number;
  albumId?: string;
  albumTitle?: string;
  artistId?: string;
  artist?: string;
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
}

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_WAVLAKE_API_URL,
});

export const getNewMusic = async () => {
  const { data } = await apiClient.get("/tracks/new");

  return data.data;
};

export const getTopMusic = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/charts/music/top");

  return data.data;
};

export const getRandomMusic = async (): Promise<Track[]> => {
  const { data } = await apiClient.get("/tracks/random");

  return data;
};

export const search = async (query: string): Promise<SearchResult[]> => {
  const { data } = await apiClient.get("/search", {
    params: {
      term: query,
    },
  });

  return data.data;
};

export const getAlbumTracks = async (albumId: string): Promise<Track[]> => {
  const { data } = await apiClient.get(`/tracks/${albumId}/album`);

  return data.data;
};

export const getArtistAlbums = async (artistId: string): Promise<Album[]> => {
  const { data } = await apiClient.get(`/albums/${artistId}/artist`);

  return data.data;
};

export const getGenres = async (): Promise<Genre[]> => {
  const { data } = await apiClient.get("/meta/music/genres");

  return data.data;
};

export const getRandomGenreTracks = async (
  genreId: string,
): Promise<Track[]> => {
  const { data } = await apiClient.get(`/tracks/random/${genreId}/genre`);

  return data;
};
