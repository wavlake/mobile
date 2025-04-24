import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { nip44 } from "nostr-tools";
import { useNostrEvents } from "@/providers";
import { getSeckey, signEvent } from "@/utils";
import { hexToBytes } from "@noble/hashes/utils";
import {
  CashuMint,
  CashuWallet,
  CheckStateEnum,
  MintQuoteState,
  Proof,
  getEncodedTokenV4,
} from "@cashu/cashu-ts";

export interface TokenEvent {
  id: string;
  mint: string;
  proofs: Proof[];
  del?: string[];
  created_at?: number;
}

interface WalletConfig {
  privkey?: string;
  mints: string[];
}

export const useCashuWallet = () => {
  const { querySync, publishEvent } = useNostrEvents();
  const { pubkey: userPubkey } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Create a mapping of mint URLs to CashuWallet instances
  const mintWallets = new Map<string, CashuWallet>();

  // Helper function to get or create a CashuWallet for a mint
  const getMintWallet = async (mintUrl: string) => {
    if (mintWallets.has(mintUrl)) {
      return mintWallets.get(mintUrl);
    }

    const mint = new CashuMint(mintUrl);
    const wallet = new CashuWallet(mint);
    await wallet.loadMint();
    mintWallets.set(mintUrl, wallet);
    return wallet;
  };

  // Query for wallet configuration (kind: 17375)
  const walletQueryKey = ["cashu-wallet", userPubkey];
  const walletQuery = useQuery({
    queryKey: walletQueryKey,
    queryFn: async (): Promise<WalletConfig | undefined> => {
      if (!userPubkey) return undefined;

      try {
        // Fetch wallet event (kind: 17375)
        const events = await querySync({
          kinds: [17375],
          authors: [userPubkey],
          limit: 1,
        });

        if (!events || events.length === 0) {
          return { mints: [] }; // No wallet found, return empty config
        }

        const walletEvent = events[0];

        // Decrypt content
        if (!walletEvent.content) return { mints: [] };
        const loggedInUserSeckey = await getSeckey();

        if (!loggedInUserSeckey) return { mints: [] };

        try {
          const decrypted = nip44.decrypt(
            walletEvent.content,
            hexToBytes(loggedInUserSeckey),
          );

          if (!decrypted) return { mints: [] };

          // Parse wallet configuration
          const config: WalletConfig = { mints: [] };

          try {
            const data = JSON.parse(decrypted);
            for (const item of data) {
              if (item[0] === "mint") {
                config.mints.push(item[1]);
              } else if (item[0] === "privkey") {
                config.privkey = item[1];
              }
            }
          } catch (e) {
            console.error("Failed to parse wallet config:", e);
          }

          return config;
        } catch (error) {
          console.error("Failed to decrypt wallet config:", error);
          toast.show("Failed to decrypt wallet configuration");
          return { mints: [] };
        }
      } catch (error) {
        console.error("Error fetching wallet:", error);
        toast.show("Failed to fetch Cashu wallet");
        return undefined;
      }
    },
    enabled: !!userPubkey,
    staleTime: 60 * 1000,
    retry: 1,
  });

  // Query for token events (kind: 7375)
  const tokensQueryKey = ["cashu-tokens", userPubkey];
  const tokensQuery = useQuery({
    queryKey: tokensQueryKey,
    queryFn: async (): Promise<TokenEvent[]> => {
      if (!userPubkey) return [];

      try {
        // Fetch token events (kind: 7375)
        const events = await querySync({
          kinds: [7375],
          authors: [userPubkey],
        });

        if (!events || events.length === 0) {
          return []; // No tokens found
        }

        const tokens: TokenEvent[] = [];

        for (const event of events) {
          try {
            if (!event.content) continue;

            const loggedInUserSeckey = await getSeckey();
            if (!loggedInUserSeckey) continue;

            try {
              // Decrypt content
              const decrypted = nip44.decrypt(
                event.content,
                hexToBytes(loggedInUserSeckey),
              );

              if (!decrypted) continue;

              const tokenData = JSON.parse(decrypted);
              tokens.push({
                id: event.id,
                mint: tokenData.mint,
                proofs: tokenData.proofs || [],
                del: tokenData.del,
                created_at: event.created_at,
              });
            } catch (error) {
              console.error("Failed to decrypt token:", error);
              // Continue to next token instead of failing entirely
            }
          } catch (e) {
            console.error("Failed to process token:", e);
          }
        }

        return tokens;
      } catch (error) {
        console.error("Error fetching tokens:", error);
        toast.show("Failed to fetch Cashu tokens");
        return [];
      }
    },
    enabled: !!userPubkey && !!walletQuery.data,
    staleTime: 30 * 1000,
    retry: 1,
  });

  // Calculate total balance across all tokens
  const balance =
    tokensQuery.data?.reduce((total, token) => {
      return total + token.proofs.reduce((sum, proof) => sum + proof.amount, 0);
    }, 0) ?? 0;

  // Get balance for a specific mint
  const getMintBalance = (mintUrl: string) => {
    return (
      tokensQuery.data?.reduce((total, token) => {
        if (token.mint !== mintUrl) return total;
        return (
          total + token.proofs.reduce((sum, proof) => sum + proof.amount, 0)
        );
      }, 0) ?? 0
    );
  };

  // Create a new wallet if none exists
  const createWallet = async (mints: string[]) => {
    if (!userPubkey) {
      toast.show("Authentication required");
      return false;
    }

    if (!mints || mints.length === 0) {
      toast.show("At least one mint URL is required");
      return false;
    }

    try {
      // Create wallet event content
      const walletData = mints.map((mint) => ["mint", mint]);

      const privateKey = await getSeckey();
      if (!privateKey) {
        toast.show("Failed to get private key");
        return false;
      }

      // Encrypt content
      const encryptedContent = nip44.encrypt(
        JSON.stringify(walletData),
        hexToBytes(privateKey),
      );

      // Create and publish wallet event
      const event = {
        kind: 17375,
        content: encryptedContent,
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = await signEvent(event);
      if (!signedEvent) {
        toast.show("Failed to sign wallet event");
        return false;
      }

      await publishEvent(signedEvent);

      // Update query data
      queryClient.setQueryData(walletQueryKey, { mints });

      // Create CashuWallet instances for each mint
      for (const mintUrl of mints) {
        try {
          await getMintWallet(mintUrl);
        } catch (error) {
          console.error(
            `Failed to initialize CashuWallet for ${mintUrl}:`,
            error,
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast.show("Failed to create Cashu wallet");
      return false;
    }
  };

  // Add mint to existing wallet
  const addMint = async (mintUrl: string) => {
    if (!userPubkey) {
      toast.show("Authentication required");
      return false;
    }

    const wallet = walletQuery.data;
    if (!wallet) {
      return createWallet([mintUrl]);
    }

    if (wallet.mints.includes(mintUrl)) {
      return true; // Mint already exists
    }

    try {
      // Initialize a CashuWallet for the new mint
      await getMintWallet(mintUrl);

      // Create updated wallet event content
      const updatedMints = [...wallet.mints, mintUrl];
      const walletData = updatedMints.map((mint) => ["mint", mint]);
      if (wallet.privkey) {
        walletData.push(["privkey", wallet.privkey]);
      }

      const privateKey = await getSeckey();
      if (!privateKey) {
        toast.show("Failed to get private key");
        return false;
      }

      // Encrypt content
      const encryptedContent = nip44.encrypt(
        JSON.stringify(walletData),
        hexToBytes(privateKey),
      );

      // Create and publish wallet event
      const event = {
        kind: 17375,
        content: encryptedContent,
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = await signEvent(event);
      if (!signedEvent) {
        toast.show("Failed to sign wallet event");
        return false;
      }
      await publishEvent(signedEvent);

      // Update query data
      queryClient.setQueryData(walletQueryKey, {
        ...wallet,
        mints: updatedMints,
      });

      return true;
    } catch (error) {
      console.error("Error adding mint:", error);
      toast.show("Failed to add mint");
      return false;
    }
  };

  // Remove mint from wallet
  const removeMint = async (mintUrl: string) => {
    if (!userPubkey) {
      toast.show("Authentication required");
      return false;
    }

    const wallet = walletQuery.data;
    if (!wallet || !wallet.mints.includes(mintUrl)) {
      return true; // Mint doesn't exist
    }

    // Check if there are tokens for this mint
    const mintTokens =
      tokensQuery.data?.filter((token) => token.mint === mintUrl) || [];
    if (mintTokens.length > 0) {
      toast.show("Cannot remove mint with active tokens");
      return false;
    }

    try {
      // Create updated wallet event content
      const updatedMints = wallet.mints.filter((mint) => mint !== mintUrl);
      const walletData = updatedMints.map((mint) => ["mint", mint]);
      if (wallet.privkey) {
        walletData.push(["privkey", wallet.privkey]);
      }

      const privateKey = await getSeckey();
      if (!privateKey) {
        toast.show("Failed to get private key");
        return false;
      }

      // Encrypt content
      const encryptedContent = nip44.encrypt(
        JSON.stringify(walletData),
        hexToBytes(privateKey),
      );

      // Create and publish wallet event
      const event = {
        kind: 17375,
        content: encryptedContent,
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = await signEvent(event);
      if (!signedEvent) {
        toast.show("Failed to sign wallet event");
        return false;
      }

      await publishEvent(signedEvent);

      // Update query data
      queryClient.setQueryData(walletQueryKey, {
        ...wallet,
        mints: updatedMints,
      });

      // Remove the wallet from our map
      mintWallets.delete(mintUrl);

      return true;
    } catch (error) {
      console.error("Error removing mint:", error);
      toast.show("Failed to remove mint");
      return false;
    }
  };

  // Add token event
  const addTokenEvent = async (
    mint: string,
    proofs: Proof[],
    delIds: string[] = [],
  ) => {
    if (!userPubkey) {
      toast.show("Authentication required");
      return { success: false };
    }

    try {
      // Create token event content
      const tokenData = {
        mint,
        proofs,
        del: delIds,
      };

      const privateKey = await getSeckey();
      if (!privateKey) {
        toast.show("Failed to get private key");
        return { success: false };
      }

      // Encrypt content
      const encryptedContent = nip44.encrypt(
        JSON.stringify(tokenData),
        hexToBytes(privateKey),
      );

      // Create and publish token event
      const event = {
        kind: 7375,
        content: encryptedContent,
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = await signEvent(event);
      if (!signedEvent) {
        toast.show("Failed to sign token event");
        return { success: false };
      }

      await publishEvent(signedEvent);

      // Update query data
      const currentTokens = tokensQuery.data || [];
      const newToken = {
        id: signedEvent.id,
        mint,
        proofs,
        del: delIds,
        created_at: signedEvent.created_at,
      };

      queryClient.setQueryData(tokensQueryKey, [...currentTokens, newToken]);

      return {
        success: true,
        tokenId: signedEvent.id,
        token: newToken,
      };
    } catch (error) {
      console.error("Error adding token:", error);
      toast.show("Failed to add Cashu token");
      return { success: false };
    }
  };

  // Delete token event
  const deleteTokenEvent = async (tokenId: string) => {
    if (!userPubkey) {
      toast.show("Authentication required");
      return false;
    }

    try {
      // Create delete event (kind: 5)
      const event = {
        kind: 5,
        content: "",
        tags: [
          ["e", tokenId],
          ["k", "7375"],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = await signEvent(event);
      if (!signedEvent) {
        toast.show("Failed to sign delete event");
        return false;
      }

      await publishEvent(signedEvent);

      // Update query data
      const currentTokens = tokensQuery.data || [];
      queryClient.setQueryData(
        tokensQueryKey,
        currentTokens.filter((token) => token.id !== tokenId),
      );

      return true;
    } catch (error) {
      console.error("Error deleting token:", error);
      toast.show("Failed to delete Cashu token");
      return false;
    }
  };

  // Record transaction history
  const recordTransaction = async (
    direction: "in" | "out",
    amount: number,
    createdEventId?: string,
    destroyedEventId?: string,
    redeemedEventId?: string,
  ) => {
    if (!userPubkey) {
      toast.show("Authentication required");
      return false;
    }

    try {
      // Create history event content
      const contentData = [
        ["direction", direction],
        ["amount", amount.toString()],
      ];

      if (createdEventId) {
        contentData.push(["e", createdEventId, "", "created"]);
      }

      if (destroyedEventId) {
        contentData.push(["e", destroyedEventId, "", "destroyed"]);
      }

      const privateKey = await getSeckey();
      if (!privateKey) {
        toast.show("Failed to get private key");
        return false;
      }

      // Encrypt content
      const encryptedContent = nip44.encrypt(
        JSON.stringify(contentData),
        hexToBytes(privateKey),
      );

      // Add tags
      const tags = [];
      if (redeemedEventId) {
        tags.push(["e", redeemedEventId, "", "redeemed"]);
      }

      // Create and publish history event
      const event = {
        kind: 7376,
        content: encryptedContent,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = await signEvent(event);
      if (!signedEvent) {
        toast.show("Failed to sign transaction event");
        return false;
      }

      await publishEvent(signedEvent);

      return true;
    } catch (error) {
      console.error("Error recording transaction:", error);
      toast.show("Failed to record transaction");
      return false;
    }
  };

  // ========== Mint API Functions Using Cashu TS ==========

  // Request a Lightning payment quote from a mint
  const requestMintQuote = async (mintUrl: string, amount: number) => {
    try {
      const cashuWallet = await getMintWallet(mintUrl);
      if (!cashuWallet) {
        toast.show("Failed to initialize Cashu wallet");
        return null;
      }
      const mintQuote = await cashuWallet.createMintQuote(amount);

      const privateKey = await getSeckey();
      // Store quote ID in a Nostr event (optional)
      if (mintQuote.quote && privateKey) {
        const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14; // 2 weeks
        const event = {
          kind: 7374,
          content: nip44.encrypt(mintQuote.quote, hexToBytes(privateKey)),
          tags: [
            ["expiration", expiry.toString()],
            ["mint", mintUrl],
          ],
          created_at: Math.floor(Date.now() / 1000),
        };

        const signedEvent = await signEvent(event);
        if (!signedEvent) {
          toast.show("Failed to sign quote event");
          return null;
        }

        await publishEvent(signedEvent);
      }

      return {
        quote: mintQuote.quote,
        request: mintQuote.request,
        pr: mintQuote.request, // For compatibility with old code
        expiry: Math.floor(Date.now() / 1000) + 1800, // Default 30 mins expiry
      };
    } catch (error) {
      console.error("Error requesting mint quote:", error);
      toast.show("Failed to get quote from mint");
      return null;
    }
  };

  // Check the status of a pending mint quote
  const checkMintQuoteStatus = async (mintUrl: string, quoteId: string) => {
    try {
      const cashuWallet = await getMintWallet(mintUrl);
      if (!cashuWallet) {
        toast.show("Failed to initialize Cashu wallet");
        return false;
      }

      const quoteStatus = await cashuWallet.checkMintQuote(quoteId);
      return quoteStatus.state === MintQuoteState.PAID;
    } catch (error) {
      console.error("Error checking quote status:", error);
      return false;
    }
  };

  // Claim tokens for a paid quote
  const claimMintTokens = async (mintUrl: string, quoteId: string) => {
    try {
      // Check if the quote is paid
      const isPaid = await checkMintQuoteStatus(mintUrl, quoteId);
      if (!isPaid) {
        toast.show("Payment has not been completed yet");
        return false;
      }

      // Get the amount from the quote
      const cashuWallet = await getMintWallet(mintUrl);
      if (!cashuWallet) {
        toast.show("Failed to initialize Cashu wallet");
        return false;
      }
      const quoteStatus = await cashuWallet.checkMintQuote(quoteId);
      if (!quoteStatus) {
        toast.show("Failed to retrieve quote status");
        return false;
      }
      // TODO fix this amount
      const amount = 2; // quoteStatus.amount;

      // Mint the proofs
      const proofs = await cashuWallet.mintProofs(amount, quoteId);

      // Convert proofs to our format
      const formattedProofs = proofs.map((p) => ({
        id: p.id,
        amount: p.amount,
        secret: p.secret,
        C: p.C,
      }));

      // Add the tokens to our Nostr event
      const result = await addTokenEvent(mintUrl, formattedProofs);

      // Record the transaction
      if (result.success && result.tokenId) {
        await recordTransaction("in", amount, result.tokenId);
      }

      return result.success;
    } catch (error) {
      console.error("Error claiming tokens:", error);
      toast.show("Failed to claim tokens from mint");
      return false;
    }
  };

  // Spend tokens
  const spendTokens = async (amount: number, mintUrl?: string) => {
    if (!userPubkey) {
      toast.show("Authentication required");
      return { success: false };
    }

    if (amount <= 0 || amount > balance) {
      toast.show(`Invalid amount: ${amount}. Available: ${balance}`);
      return { success: false };
    }

    // Find tokens to spend
    const tokens = tokensQuery.data || [];
    const tokensToUse: {
      token: TokenEvent;
      proofsToSpend: Proof[];
      proofsToKeep: Proof[];
    }[] = [];

    let remaining = amount;

    // If mintUrl is specified, only use tokens from that mint
    const filteredTokens = mintUrl
      ? tokens.filter((t) => t.mint === mintUrl)
      : tokens;

    for (const token of filteredTokens) {
      if (remaining <= 0) break;

      const proofsToSpend: Proof[] = [];
      const proofsToKeep: Proof[] = [];

      for (const proof of token.proofs) {
        if (remaining <= 0 || proof.amount > remaining) {
          proofsToKeep.push(proof);
        } else {
          proofsToSpend.push(proof);
          remaining -= proof.amount;
        }
      }

      if (proofsToSpend.length > 0) {
        tokensToUse.push({ token, proofsToSpend, proofsToKeep });
      }
    }

    if (remaining > 0) {
      toast.show(`Not enough funds of the right denomination`);
      return { success: false };
    }

    try {
      // Process each token
      const resultProofs: CashuProof[] = [];

      for (const { token, proofsToSpend, proofsToKeep } of tokensToUse) {
        // First, delete the original token
        await deleteTokenEvent(token.id);

        // If we have proofs to keep, create a new token event for them
        if (proofsToKeep.length > 0) {
          const keepResult = await addTokenEvent(token.mint, proofsToKeep, [
            token.id,
          ]);
        }

        // Add the spent proofs to our result
        resultProofs.push(...proofsToSpend);
      }

      // Record the transaction
      await recordTransaction("out", amount);

      return { success: true, proofs: resultProofs };
    } catch (error) {
      console.error("Error spending tokens:", error);
      toast.show("Failed to spend tokens");
      return { success: false };
    }
  };

  // Melt tokens to pay a Lightning invoice using Cashu TS
  const meltTokens = async (
    mintUrl: string,
    invoice: string,
    amount?: number,
  ) => {
    try {
      const cashuWallet = await getMintWallet(mintUrl);

      if (!cashuWallet) {
        toast.show("Failed to initialize Cashu wallet");
        return false;
      }

      // Create a melt quote
      const meltQuote = await cashuWallet.createMeltQuote(invoice);

      // Get the amount to spend (including fee reserve)
      const amountToSpend = amount || meltQuote.amount + meltQuote.fee_reserve;

      // Get proofs to spend
      const spendResult = await spendTokens(amountToSpend, mintUrl);
      if (!spendResult.success || !spendResult.proofs) {
        return false;
      }

      // Melt the proofs
      const meltResponse = await cashuWallet.meltProofs(
        meltQuote,
        spendResult.proofs,
      );

      // If change is returned, add it back to our wallet
      if (meltResponse.change && meltResponse.change.length > 0) {
        // Convert change proofs to our format
        const formattedChangeProofs = meltResponse.change.map((p) => ({
          id: p.id,
          amount: p.amount,
          secret: p.secret,
          C: p.C,
        }));

        await addTokenEvent(mintUrl, formattedChangeProofs);
      }

      return true;
    } catch (error) {
      console.error("Error melting tokens:", error);
      toast.show("Failed to pay Lightning invoice");
      return false;
    }
  };

  // Swap tokens using cashu-ts
  const swapTokens = async (
    mintUrl: string,
    proofs: Proof[],
    outputs: number[],
  ) => {
    try {
      const cashuWallet = await getMintWallet(mintUrl);

      // Convert our proofs to cashu-ts format
      const cashuProofs = proofs.map((p) => ({
        id: p.id,
        amount: p.amount,
        secret: p.secret,
        C: p.C,
      }));

      // Perform the swap
      const swappedProofs = await cashuWallet.swap(cashuProofs, outputs);

      // First, remove these proofs from our wallet
      const tokens = tokensQuery.data || [];
      let deletedTokenIds: string[] = [];

      // Find tokens containing these proofs
      for (const token of tokens) {
        if (token.mint !== mintUrl) continue;

        const matchingProofs = token.proofs.filter((p) =>
          proofs.some((sp) => sp.id === p.id),
        );

        if (matchingProofs.length > 0) {
          // Delete this token
          await deleteTokenEvent(token.id);
          deletedTokenIds.push(token.id);

          // If there are proofs to keep, create a new token for them
          const proofsToKeep = token.proofs.filter(
            (p) => !proofs.some((sp) => sp.id === p.id),
          );

          if (proofsToKeep.length > 0) {
            await addTokenEvent(mintUrl, proofsToKeep, [token.id]);
          }
        }
      }

      // Convert swapped proofs to our format and add to wallet
      if (swappedProofs && swappedProofs.length > 0) {
        const formattedProofs = swappedProofs.map((p) => ({
          id: p.id,
          amount: p.amount,
          secret: p.secret,
          C: p.C,
        }));

        await addTokenEvent(mintUrl, formattedProofs, deletedTokenIds);
      }

      return true;
    } catch (error) {
      console.error("Error swapping tokens:", error);
      toast.show("Failed to swap tokens");
      return false;
    }
  };

  // Validate tokens using cashu-ts
  const validateTokens = async (mintUrl: string, proofs: Proof[]) => {
    try {
      const cashuWallet = await getMintWallet(mintUrl);
      if (!cashuWallet) {
        toast.show("Failed to initialize Cashu wallet");
        return false;
      }

      // Check if proofs are spent
      const checkResult = await cashuWallet.checkProofsStates(proofs);

      // Get spent proofs
      const spentProofIds = checkResult.filter(
        (check) => check.state === CheckStateEnum.SPENT,
      );

      if (spentProofIds.length > 0) {
        // Find and update tokens with spent proofs
        const tokens = tokensQuery.data || [];

        for (const token of tokens) {
          if (token.mint !== mintUrl) continue;

          const hasSpentProofs = token.proofs.some((p) =>
            spentProofIds.includes(p.id),
          );

          if (hasSpentProofs) {
            // Delete this token
            await deleteTokenEvent(token.id);

            // If there are unspent proofs, create a new token for them
            const validProofs = token.proofs.filter(
              (p) => !spentProofIds.includes(p.id),
            );

            if (validProofs.length > 0) {
              await addTokenEvent(mintUrl, validProofs, [token.id]);
            }
          }
        }

        return false; // Some proofs were spent
      }

      return true; // All proofs are valid
    } catch (error) {
      console.error("Error validating tokens:", error);
      toast.show("Failed to validate tokens");
      return false;
    }
  };

  // Generate token for sending
  const generateToken = async (amount: number, mintUrl?: string) => {
    // Spend the tokens first
    const spendResult = await spendTokens(amount, mintUrl);
    if (!spendResult.success || !spendResult.proofs?.length) {
      return null;
    }

    // Determine which mint the proofs are from
    const proofMint =
      mintUrl ||
      tokensQuery.data?.find((t) =>
        t.proofs.some((p) => spendResult.proofs.some((sp) => sp.id === p.id)),
      )?.mint;

    if (!proofMint) {
      toast.show("Could not determine mint for proofs");
      return null;
    }

    // Generate a token using the cashu-ts library
    try {
      // Format token data for getEncodedTokenV4
      const tokenData = {
        token: [
          {
            mint: proofMint,
            proofs: spendResult.proofs,
          },
        ],
      };

      // Use the cashu-ts library to encode the token
      return getEncodedTokenV4(tokenData);
    } catch (error) {
      console.error("Error generating token:", error);
      toast.show("Failed to generate token");
      return null;
    }
  };

  // Receive a token
  const receiveToken = async (token: string) => {
    try {
      // First, determine which cashu-ts wallet to use by parsing the token
      // We'll use the first mint we have or create a new wallet
      const firstWallet = mintWallets.values().next().value;

      // Use the cashu-ts library to decode and receive the token
      const { token: decodedToken, proofs } = await firstWallet.receive(token);

      if (!decodedToken || !proofs || proofs.length === 0) {
        toast.show("Invalid or empty token");
        return false;
      }

      // For each mint in the token, store the proofs
      let success = true;
      let totalAmount = 0;

      for (const mintToken of decodedToken) {
        const mintUrl = mintToken.mint;

        // Make sure we have a wallet for this mint
        if (!walletQuery.data?.mints.includes(mintUrl)) {
          await addMint(mintUrl);
        }

        // Get or create a cashu wallet for this mint
        const cashuWallet = await getMintWallet(mintUrl);

        // Format the proofs
        const mintProofs = proofs
          .filter((p) => mintToken.proofs.some((mp) => mp.id === p.id))
          .map((p) => ({
            id: p.id,
            amount: p.amount,
            secret: p.secret,
            C: p.C,
          }));

        // Calculate total amount
        const mintAmount = mintProofs.reduce((sum, p) => sum + p.amount, 0);
        totalAmount += mintAmount;

        // Store the proofs in our Nostr events
        const result = await addTokenEvent(mintUrl, mintProofs);
        if (!result.success) {
          success = false;
        }
      }

      // Record the transaction if successful
      if (success && totalAmount > 0) {
        await recordTransaction("in", totalAmount);
      }

      return success;
    } catch (error) {
      console.error("Error receiving token:", error);
      toast.show("Failed to receive token");
      return false;
    }
  };

  // Refresh query data
  const refreshWallet = async () => {
    await Promise.all([walletQuery.refetch(), tokensQuery.refetch()]);
  };

  return {
    // Wallet state
    wallet: walletQuery.data,
    tokens: tokensQuery.data,
    balance,
    isLoading: walletQuery.isLoading || tokensQuery.isLoading,
    isError: walletQuery.isError || tokensQuery.isError,

    // Wallet management
    createWallet,
    addMint,
    removeMint,
    getMintBalance,
    refreshWallet,

    // Token management
    addTokenEvent,
    deleteTokenEvent,
    recordTransaction,

    // Mint interactions
    requestMintQuote,
    checkMintQuoteStatus,
    claimMintTokens,
    spendTokens,
    meltTokens,
    swapTokens,
    validateTokens,

    // Token operations
    generateToken,
    receiveToken,
  };
};
