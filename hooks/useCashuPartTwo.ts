import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { CashuMint } from "@cashu/cashu-ts";
import { useToast } from "./useToast";
import { useNostrEvents } from "@/providers";
import { useAuth } from "./useAuth";
import { signEvent } from "@/utils";

// Query key constants
export const MINT_INFO = "mint-info";
export const MINT_KEYS = "mint-keys";
export const MINT_LIST = "mint-list";
export const NUTZAPS = "nutzaps";
export const REDEEMED_NUTZAPS = "redeemed-nutzaps";

// Regular expression for Cashu tokens
export const cashuRegex = /(cashu[AB][A-Za-z0-9_-]{0,10000}={0,3})/g;

/**
 * Hook to fetch mint information
 * @param {string} url - Mint URL
 * @returns {object} Query result with mint information
 */
export function useMintInfo(url: string) {
  const toast = useToast();

  return useQuery({
    queryKey: [MINT_INFO, url],
    queryFn: async () => {
      try {
        return await CashuMint.getInfo(url);
      } catch (error) {
        console.error("Error fetching mint info:", error);
        toast.show("Error fetching mint info");
      }
    },
    staleTime: Infinity,
    gcTime: 0,
    enabled: Boolean(url),
  });
}

/**
 * Function to fetch mint information and store in cache
 * @param {string} url - Mint URL
 * @returns {Promise<GetInfoResponse>} Mint information
 */
export async function fetchMintInfo(url: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  try {
    return await queryClient.fetchQuery({
      queryKey: [MINT_INFO, url],
      queryFn: () => CashuMint.getInfo(url),
      staleTime: Infinity,
      gcTime: 0,
    });
  } catch (error) {
    console.error("Error fetching mint info:", error);
    toast.show("Error fetching mint info");
  }
}

/**
 * Hook to fetch mint keys
 * @param {string} url - Mint URL
 * @returns {object} Query result with mint keys
 */
export function useMintKeys(url: string) {
  const toast = useToast();

  return useQuery({
    queryKey: [MINT_KEYS, url],
    queryFn: async () => {
      try {
        const keys = await CashuMint.getKeys(url);
        return keys.keysets;
      } catch (error) {
        console.error("Error fetching mint keys:", error);
        toast.show("Error fetching mint keys");
      }
    },
    staleTime: Infinity,
    gcTime: 0,
    enabled: Boolean(url),
  });
}

/**
 * Function to fetch mint keys and store in cache
 * @param {string} url - Mint URL
 * @returns {Promise<Array<MintKeys>>} Mint keys
 */
export function fetchMintKeys(url: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  try {
    return queryClient.fetchQuery({
      queryKey: [MINT_KEYS, url],
      queryFn: async () => {
        const keys = await CashuMint.getKeys(url);
        return keys.keysets;
      },
      staleTime: Infinity,
      gcTime: 0,
    });
  } catch (error) {
    console.error("Error fetching mint keys:", error);
    toast.show("Error fetching mint keys");
  }
}

/**
 * Hook to fetch a user's mint list
 * @param {string} pubkey - User pubkey
 * @returns {object} Query result with mint list
 */
export function useMintList() {
  const { pubkey } = useAuth();
  const { querySync } = useNostrEvents();
  const toast = useToast();

  return useQuery({
    queryKey: [MINT_LIST, pubkey],
    queryFn: async () => {
      try {
        const filter = {
          kinds: [10019],
          authors: [pubkey],
        };

        const events = await querySync(filter);

        if (events && events.length > 0) {
          // Use the most recent event
          const event = events[0];

          const mints = event.tags
            .filter((t) => t[0] === "mint")
            .map((t) => t[1]);

          const pubkeyTag = event.tags.find((t) => t[0] === "pubkey")?.[1];

          const relays = event.tags
            .filter((t) => t[0] === "relay")
            .map((t) => t[1]);

          return { mints, pubkey: pubkeyTag, relays };
        }

        throw new Error("No mint list found");
      } catch (error) {
        console.error("Error fetching mint list:", error);
        toast.show("Error fetching mint list");
      }
    },
    enabled: Boolean(pubkey),
  });
}

/**
 * Hook to fetch sent nutzaps for the current user
 * @returns {Array<NDKEvent>} Sorted list of sent nutzaps
 */
export function useSentNutzaps() {
  const { pubkey } = useAuth();
  const { querySync } = useNostrEvents();
  const toast = useToast();

  const { data: events = [], isLoading } = useQuery({
    queryKey: [NUTZAPS, "sent", pubkey],
    queryFn: async () => {
      try {
        const filter = {
          kinds: [9321],
          authors: [pubkey],
        };

        return await querySync(filter);
      } catch (error) {
        console.error("Error fetching sent nutzaps:", error);
        toast.show("Error fetching sent nutzaps");

        return [];
      }
    },
    enabled: Boolean(pubkey),
  });

  const sorted = useMemo(
    () => events.sort((a, b) => b.created_at - a.created_at),
    [events],
  );

  return { events: sorted, isLoading };
}

/**
 * Hook to fetch all nutzaps from the local database
 * @returns {Array<object>} List of nutzaps
 */
export function useNutzaps() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useQuery({
    queryKey: [NUTZAPS, "all"],
    queryFn: async () => {
      try {
        // Instead of using Dexie directly, we'll use an async function
        // Assuming you have a function to get nutzaps from your database
        const getNutzapsFromStorage = async () => {
          // Replace this with your actual implementation to get nutzaps from storage
          // For example, using AsyncStorage or a similar solution
          return []; // Placeholder
        };

        return await getNutzapsFromStorage();
      } catch (error) {
        toast.show("Error fetching nutzaps from storage");

        return [];
      }
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch redeemed nutzaps
 * @returns {Set<string>} Set of redeemed nutzap event IDs
 */
export function useRedeemedNutzaps() {
  const { pubkey } = useAuth();
  const { querySync } = useNostrEvents();
  const toast = useToast();

  const { data: mintList } = useMintList();

  const { data: events = [] } = useQuery({
    queryKey: [REDEEMED_NUTZAPS, pubkey],
    queryFn: async () => {
      try {
        const filter = {
          kinds: [7376],
          authors: [pubkey],
        };

        // Use available relays from mint list if available
        const relayUrls = mintList?.relays || [];

        return await querySync(filter, relayUrls);
      } catch (error) {
        toast.show("Error fetching redeemed nutzaps");
        return [];
      }
    },
    enabled: Boolean(pubkey),
  });

  const redeemed = useMemo(() => {
    const redemptions = events
      .map((c) => c.tags.find((t) => t[0] === "e" && t[3] === "redeemed")?.[1])
      .filter(Boolean);

    return new Set(redemptions);
  }, [events]);

  return redeemed;
}

/**
 * Hook to publish a new mint list for the user
 * @returns {function} Function to publish a mint list
 */
export function usePublishMintList() {
  const { pubkey } = useAuth();
  const { publishEvent } = useNostrEvents();
  const queryClient = useQueryClient();
  const toast = useToast();

  return async (mints: string[], relays = []) => {
    if (!pubkey) {
      toast.show("Authentication required");

      return null;
    }

    try {
      // Create tags
      const tags = [["pubkey", pubkey]];

      // Add mint tags
      mints.forEach((mint) => {
        tags.push(["mint", mint]);
      });

      // Add relay tags
      relays.forEach((relay) => {
        tags.push(["relay", relay]);
      });

      const signedEvent = await signEvent({
        kind: 10019,
        tags,
        content: "",
        created_at: Math.floor(Date.now() / 1000),
      });

      if (!signedEvent) {
        throw new Error("Failed to sign event");
      }
      // Publish event
      const event = await publishEvent(signedEvent);

      // Invalidate queries
      await queryClient.invalidateQueries({
        queryKey: [MINT_LIST, pubkey],
      });

      toast.show(`Successfully published list with ${mints.length} mints`);

      return event;
    } catch (err) {
      toast.show("Failed to publish mint list");

      return null;
    }
  };
}
