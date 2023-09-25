import axios from "axios";

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistUrl: string;
  avatarUrl: string;
  artworkUrl: string;
  albumTitle: string;
  liveUrl: string;
  duration: number;
}

interface TrackResponse extends Track {
  [key: string]: unknown;
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
  count: number;
}

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_WAVLAKE_API_URL,
});

const normalizeTrackResponse = (res: TrackResponse[]): Track[] => {
  return res.map(
    ({
      id,
      title,
      artist,
      artistUrl,
      avatarUrl,
      artworkUrl,
      albumTitle,
      liveUrl,
      duration,
    }) => ({
      id,
      title,
      artist,
      artistUrl,
      avatarUrl,
      artworkUrl,
      albumTitle,
      liveUrl,
      duration,
    }),
  );
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

export const getAlbumTracks = async (albumId: string): Promise<Track[]> => {
  const { data } = await apiClient.get(`/tracks/${albumId}/album`);

  return normalizeTrackResponse(data.data);
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
