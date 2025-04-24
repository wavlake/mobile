import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./useAuth";
import { useCashuMint } from "./useCashuMint";

const PROOFS_STORAGE_KEY = "cashu-proofs";

export function useCashuProofs(mintUrl?: string) {
  const { pubkey: userPubkey } = useAuth();
  const queryClient = useQueryClient();
  const { wallet, actions } = useCashuMint({ mintUrl });

  // Get the storage key specific to this user and mint
  const getUserStorageKey = useCallback(() => {
    const key = mintUrl || "";
    return `${PROOFS_STORAGE_KEY}:${userPubkey}:${key}`;
  }, [userPubkey, mintUrl]);

  // Load proofs from storage
  const {
    data: proofs = [],
    isLoading,
    refetch,
  } = useQuery<any[]>({
    queryKey: [PROOFS_STORAGE_KEY, userPubkey, mintUrl],
    queryFn: async () => {
      try {
        const storageKey = getUserStorageKey();
        const storedProofs = await AsyncStorage.getItem(storageKey);
        return storedProofs ? JSON.parse(storedProofs) : [];
      } catch (error) {
        console.error("Failed to load proofs from storage:", error);
        return [];
      }
    },
  });

  // Save proofs to storage
  const saveProofs = useMutation({
    mutationFn: async (newProofs: any[]) => {
      const storageKey = getUserStorageKey();
      const currentProofs = proofs || [];
      const combinedProofs = [...currentProofs, ...newProofs];

      await AsyncStorage.setItem(storageKey, JSON.stringify(combinedProofs));

      return combinedProofs;
    },
    onSuccess: (savedProofs) => {
      queryClient.setQueryData(
        [PROOFS_STORAGE_KEY, userPubkey, mintUrl],
        savedProofs,
      );
    },
  });

  // Update proofs (e.g., after spending)
  const updateProofs = useMutation({
    mutationFn: async (updatedProofs: any[]) => {
      const storageKey = getUserStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedProofs));
      return updatedProofs;
    },
    onSuccess: (updatedProofs) => {
      queryClient.setQueryData(
        [PROOFS_STORAGE_KEY, userPubkey, mintUrl],
        updatedProofs,
      );
    },
  });

  // Check if stored proofs are still valid (not spent)
  const validateProofs = useMutation({
    mutationFn: async () => {
      if (!wallet || !proofs || proofs.length === 0) {
        return proofs || [];
      }

      // Check proof states
      const states = await actions.checkProofsStates.mutateAsync(proofs);

      // Filter out spent proofs
      const validProofs = proofs.filter(
        (_, index) => states[index].state === "UNSPENT",
      );

      return validProofs;
    },
    onSuccess: (validProofs) => {
      // Update storage with only valid proofs
      updateProofs.mutate(validProofs);
    },
  });

  // Calculate the total amount of unspent proofs
  const totalBalance = proofs ? actions.getProofsTotal(proofs) : 0;

  return {
    proofs,
    isLoading,
    totalBalance,
    actions: {
      saveProofs,
      updateProofs,
      validateProofs,
      refreshProofs: refetch,
    },
  };
}
