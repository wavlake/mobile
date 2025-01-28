import axios, { AxiosError } from "axios";

// Define types for better type safety
type NostrBandResponse = {
  stats: {
    [pubkey: string]: {
      followers_pubkey_count: number;
    };
  };
};

const nostrBandApi = axios.create({
  baseURL: "https://api.nostr.band",
  timeout: 10000,
});

export const fetchFollowersCount = async (publicHex: string) => {
  try {
    const response = await nostrBandApi.get<NostrBandResponse>(
      `/v0/stats/profile/${publicHex}`,
    );
    return response.data.stats[publicHex]?.followers_pubkey_count ?? 0;
  } catch (err) {
    console.error("Error fetching followers list from nostr.band API: ", err);
    if (err instanceof AxiosError && err.response?.status === 404) {
      return 0;
    }
    throw err; // Let React Query handle other errors
  }
};
