import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "./useToast";
import { CashuMint } from "@cashu/cashu-ts";

// Constants
const DEFAULT_MINT_URL = "https://mint.minibits.cash/Bitcoin";
const MINTS_STORAGE_KEY = "cashu-mints";
const ACTIVE_MINT_KEY = "cashu-active-mint";

export function useCashuManageMints() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Get all mints
  const {
    data: mints = [],
    isLoading: isLoadingMints,
    refetch: refetchMints,
  } = useQuery({
    queryKey: ["cashu-mints"],
    queryFn: async () => {
      try {
        const storedMints = await AsyncStorage.getItem(MINTS_STORAGE_KEY);
        console.log("Stored mints:", storedMints);
        return storedMints ? JSON.parse(storedMints) : [DEFAULT_MINT_URL];
      } catch (error) {
        console.error("Failed to load mints:", error);
        return [DEFAULT_MINT_URL];
      }
    },
  });

  // Get active mint
  const { data: activeMint, isLoading: isLoadingActiveMint } = useQuery({
    queryKey: ["active-mint"],
    queryFn: async () => {
      try {
        const storedActiveMint = await AsyncStorage.getItem(ACTIVE_MINT_KEY);
        return (
          storedActiveMint ||
          (mints && mints.length > 0 ? mints[0] : DEFAULT_MINT_URL)
        );
      } catch (error) {
        console.error("Failed to get active mint:", error);
        return mints && mints.length > 0 ? mints[0] : DEFAULT_MINT_URL;
      }
    },
    enabled: !!mints,
  });

  // Add a new mint
  const addMint = useMutation({
    mutationFn: async (mintUrl: string) => {
      try {
        // Validate mint URL by trying to connect to it
        const mint = new CashuMint(mintUrl);
        await mint.getInfo();

        // Add to list if valid
        const updatedMints = [...(mints || [])];
        console.log("Current mints:", updatedMints);
        if (!updatedMints.includes(mintUrl)) {
          updatedMints.push(mintUrl);
          await AsyncStorage.setItem(
            MINTS_STORAGE_KEY,
            JSON.stringify(updatedMints),
          );
        }

        // Set as active if it's the first one
        if (updatedMints.length === 1) {
          await AsyncStorage.setItem(ACTIVE_MINT_KEY, mintUrl);
        }

        // Refresh mint list
        queryClient.invalidateQueries({ queryKey: ["cashu-mints"] });
        if (updatedMints.length === 1) {
          queryClient.invalidateQueries({ queryKey: ["active-mint"] });
        }

        return updatedMints;
      } catch (error) {
        console.error("Failed to add mint:", error);
        throw new Error(
          "Failed to validate mint. Please check if the URL is correct and the mint is online.",
        );
      }
    },
    onSuccess: () => {
      toast.show("Mint successfully added");
      refetchMints();
    },
  });

  // Remove a mint
  const removeMint = useMutation({
    mutationFn: async (mintUrl: string) => {
      const updatedMints = (mints || []).filter(
        (mint: any) => mint !== mintUrl,
      );
      console.log("removing, Updated mints:", updatedMints);
      await AsyncStorage.setItem(
        MINTS_STORAGE_KEY,
        JSON.stringify(updatedMints),
      );

      // If we removed the active mint, set a new one
      if (activeMint === mintUrl && updatedMints.length > 0) {
        await AsyncStorage.setItem(ACTIVE_MINT_KEY, updatedMints[0]);
        queryClient.invalidateQueries({ queryKey: ["active-mint"] });
      }

      queryClient.invalidateQueries({ queryKey: ["cashu-mints"] });
      return updatedMints;
    },
    onSuccess: () => {
      toast.show("Mint successfully removed");
      refetchMints();
    },
  });

  // Set active mint
  const setActiveMint = useMutation({
    mutationFn: async (mintUrl: string) => {
      await AsyncStorage.setItem(ACTIVE_MINT_KEY, mintUrl);
      queryClient.invalidateQueries({ queryKey: ["active-mint"] });
      return mintUrl;
    },
    onSuccess: (mintUrl) => {
      toast.show(`Set ${mintUrl} as active mint`);
    },
  });

  return {
    mints,
    activeMint,
    isLoading: isLoadingMints || isLoadingActiveMint,
    actions: {
      addMint,
      removeMint,
      setActiveMint,
      refreshMints: refetchMints,
    },
  };
}
