import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { CashuMint, CashuWallet, getEncodedToken } from "@cashu/cashu-ts";
import { useNostrEvents } from "@/providers";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants
const DEFAULT_MINT_URL = "https://mint.minibits.cash/Bitcoin";
const WALLET_STORAGE_KEY = "cashu-wallet-data";
const QUERY_KEY = "cashu-wallet";

export interface CashuWalletHookProps {
  mintUrl?: string;
  options?: {
    unit?: string;
  };
}

export function useCashuMint({
  mintUrl = DEFAULT_MINT_URL,
  options = { unit: "sat" },
}: CashuWalletHookProps = {}) {
  const { querySync, publishEvent } = useNostrEvents();
  const { pubkey: userPubkey } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Get active mint from props or from storage
  const { data: activeMintUrl, isLoading: isLoadingMintUrl } = useQuery({
    queryKey: ["active-mint"],
    queryFn: async () => {
      if (mintUrl) return mintUrl;
      try {
        const storedMint = await AsyncStorage.getItem("cashu-active-mint");
        return storedMint || DEFAULT_MINT_URL;
      } catch (error) {
        console.error("Failed to get active mint:", error);
        return DEFAULT_MINT_URL;
      }
    },
  });

  // Create or retrieve the wallet instance
  const { data: wallet, isLoading: isWalletLoading } = useQuery({
    queryKey: [QUERY_KEY, activeMintUrl, userPubkey],
    queryFn: async () => {
      try {
        const mint = new CashuMint(activeMintUrl || DEFAULT_MINT_URL);
        const wallet = new CashuWallet(mint, options);

        // Try to initialize the wallet with keys
        const keys = await wallet.getKeys();
        console.log("Wallet keys:", keys);
        return wallet;
      } catch (error) {
        console.error("Failed to initialize wallet:", error);
        toast.show("Failed to initialize Cashu wallet");
        throw error;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: !!activeMintUrl,
  });

  // Get wallet info (mint info and keysets)
  const { data: walletInfo, isLoading: isInfoLoading } = useQuery({
    queryKey: [QUERY_KEY, "info", activeMintUrl],
    queryFn: async () => {
      if (!wallet) throw new Error("Wallet not initialized");

      const [info, keySets] = await Promise.all([
        wallet.mint.getInfo(),
        wallet.mint.getKeySets(),
      ]);

      return { info, keySets };
    },
    enabled: !!wallet,
  });

  // Set active mint - useful for managing multiple mints
  const setActiveMint = useMutation({
    mutationFn: async (newMintUrl: string) => {
      await AsyncStorage.setItem("cashu-active-mint", newMintUrl);
      queryClient.invalidateQueries({ queryKey: ["active-mint"] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      return newMintUrl;
    },
  });

  // Create a mint quote
  const createMintQuote = useMutation({
    mutationFn: async ({
      amount,
      description,
    }: {
      amount: number;
      description?: string;
    }) => {
      if (!wallet) throw new Error("Wallet not initialized");
      return await wallet.createMintQuote(amount, description);
    },
    onSuccess: (data, params) => {
      toast.show(`Created mint quote for ${params.amount} sats`);
      return data;
    },
    onError: (error) => {
      toast.show(
        `Failed to create mint quote: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    },
  });

  // Check mint quote status
  const checkMintQuote = useMutation({
    mutationFn: async (quoteId: string) => {
      if (!wallet) throw new Error("Wallet not initialized");
      return await wallet.checkMintQuote(quoteId);
    },
  });

  // Mint proofs
  const mintProofs = useMutation({
    mutationFn: async ({
      amount,
      quoteId,
      options,
    }: {
      amount: number;
      quoteId: string;
      options?: any;
    }) => {
      if (!wallet) throw new Error("Wallet not initialized");
      return await wallet.mintProofs(amount, quoteId, options);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "proofs"] });
      toast.show(
        `Successfully minted ${data.reduce(
          (sum, proof) => sum + proof.amount,
          0,
        )} sats`,
      );
      return data;
    },
  });

  // Create a melt quote (for paying an invoice)
  const createMeltQuote = useMutation({
    mutationFn: async (invoice: string) => {
      if (!wallet) throw new Error("Wallet not initialized");
      return await wallet.createMeltQuote(invoice);
    },
    onSuccess: (data) => {
      toast.show(
        `Created melt quote for ${data.amount} sats (fee: ${data.fee_reserve} sats)`,
      );
      return data;
    },
  });

  // Check melt quote status
  const checkMeltQuote = useMutation({
    mutationFn: async (quoteId: string) => {
      if (!wallet) throw new Error("Wallet not initialized");
      return await wallet.checkMeltQuote(quoteId);
    },
  });

  // Melt proofs (pay an invoice)
  const meltProofs = useMutation({
    mutationFn: async ({
      meltQuote,
      proofs,
      options,
    }: {
      meltQuote: any;
      proofs: any[];
      options?: any;
    }) => {
      if (!wallet) throw new Error("Wallet not initialized");
      return await wallet.meltProofs(meltQuote, proofs, options);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "proofs"] });
      toast.show("Successfully paid invoice with ecash");
      return data;
    },
  });

  // Send tokens
  const sendTokens = useMutation({
    mutationFn: async ({
      amount,
      proofs,
      options,
    }: {
      amount: number;
      proofs: any[];
      options?: any;
    }) => {
      if (!wallet) throw new Error("Wallet not initialized");
      const sendResponse = await wallet.send(amount, proofs, options);
      const encodedToken = getEncodedToken({
        mint: mintUrl,
        proofs: sendResponse.send,
      });

      return {
        encodedToken,
        response: sendResponse,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "proofs"] });
      return data;
    },
  });

  // Receive tokens
  const receiveTokens = useMutation({
    mutationFn: async ({
      encodedToken,
      options,
    }: {
      encodedToken: string;
      options?: any;
    }) => {
      if (!wallet) throw new Error("Wallet not initialized");
      console.log("Receiving tokens:", wallet);
      return wallet.receive(encodedToken, options);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "proofs"] });
      toast.show(
        `Successfully received ${data.reduce(
          (sum, proof) => sum + proof.amount,
          0,
        )} sats`,
      );
      return data;
    },
  });

  // Check proof states (to see if they're spent or unspent)
  const checkProofsStates = useMutation({
    mutationFn: async (proofs: any[]) => {
      if (!wallet) throw new Error("Wallet not initialized");
      return await wallet.checkProofsStates(proofs);
    },
  });

  // Helper to sum proofs amounts
  const getProofsTotal = useCallback((proofs: any[]) => {
    if (!proofs || !Array.isArray(proofs)) return 0;
    return proofs.reduce((sum, proof) => sum + (proof.amount || 0), 0);
  }, []);

  return {
    wallet,
    mintUrl,
    isLoading: isWalletLoading || isInfoLoading,
    info: walletInfo,
    actions: {
      createMintQuote,
      checkMintQuote,
      mintProofs,
      createMeltQuote,
      checkMeltQuote,
      meltProofs,
      sendTokens,
      receiveTokens,
      checkProofsStates,
      getProofsTotal,
    },
  };
}
