import axios from "axios";

interface MusicItem {
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

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_WAVLAKE_API_URL,
});

export const getNewMusic = async () => {
  const { data } = await apiClient.get("/tracks/new");

  return data.data;
};

export const getTopMusic = async (): Promise<MusicItem[]> => {
  const { data } = await apiClient.get("/charts/music/top");

  return data.data;
};

export const getRandomMusic = async (): Promise<MusicItem[]> => {
  const { data } = await apiClient.get("/tracks/random");

  return data;
};
