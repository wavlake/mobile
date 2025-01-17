import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

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

const fetchFollowersList = async (publicHex: string) => {
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

export const useFollowersCount = (publicHex: string | undefined) => {
  return useQuery({
    queryKey: ["followers", publicHex],
    queryFn: () => {
      if (!publicHex) return Promise.resolve(0);
      return fetchFollowersList(publicHex);
    },
    enabled: !!publicHex,
    staleTime: 24 * 60 * 60 * 1000, // Data considered fresh for 5 minutes
    retry: 1,
  });
};
