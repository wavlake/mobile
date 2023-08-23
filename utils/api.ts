import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_WAVLAKE_API_URL,
});

export const getNewMusic = async () => {
  const { data } = await apiClient.get("/tracks/new");

  return data.data;
};
