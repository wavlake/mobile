import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { nip44 } from "nostr-tools";
import { useNostrEvents } from "@/providers";
import { getSeckey, signEvent } from "@/utils";
import { hexToBytes } from "@noble/hashes/utils";

// Types for NIP-60
export interface CashuProof {
  id: string;
  amount: number;
  secret?: string;
  C?: string;
}

export interface TokenEvent {
  id: string;
  mint: string;
  proofs: CashuProof[];
  del?: string[];
  created_at?: number;
}

interface WalletConfig {
  privkey?: string;
  mints: string[];
}

// Mint API response types
interface MintQuoteResponse {
  quote: string;
  request: string;
  pr: string;
  expiry: number;
}

interface MintSwapResponse {
  proofs: CashuProof[];
}

export const useCashuWallet = () => {
  const { querySync, publishEvent } = useNostrEvents();
  const { pubkey: userPubkey } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

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

        const decrypted = nip44.decrypt(
          walletEvent.content,
          hexToBytes(loggedInUserSeckey),
        );
        console.log({ decrypted });
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
        console.log({ config });
        return config;
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
      return [];
      // if (!userPubkey) return [];

      // try {
      //   // Fetch token events (kind: 7375)
      //   const events = await querySync({
      //     kinds: [7375],
      //     authors: [userPubkey],
      //   });

      //   if (!events || events.length === 0) {
      //     return []; // No tokens found
      //   }

      //   const tokens: TokenEvent[] = [];

      //   for (const event of events) {
      //     try {
      //       if (!event.content) continue;

      //       const loggedInUserSeckey = await getSeckey();
      //       console.log({ loggedInUserSeckey });

      //       if (!loggedInUserSeckey) continue;

      //       // Decrypt content
      //       const decrypted = nip44.decrypt(
      //         event.content,
      //         hexToBytes(loggedInUserSeckey),
      //       );
      //       if (!decrypted) continue;

      //       const tokenData = JSON.parse(decrypted);
      //       tokens.push({
      //         id: event.id,
      //         mint: tokenData.mint,
      //         proofs: tokenData.proofs || [],
      //         del: tokenData.del,
      //         created_at: event.created_at,
      //       });
      //     } catch (e) {
      //       console.log({ event });
      //       console.error("Failed to decrypt/parse token:", e);
      //     }
      //   }

      //   return tokens;
      // } catch (error) {
      //   console.error("Error fetching tokens:", error);
      //   toast.show("Failed to fetch Cashu tokens");
      //   return [];
      // }
    },
    enabled: false, //!!userPubkey && !!walletQuery.data,
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
    proofs: CashuProof[],
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
      const pubs = await publishEvent(signedEvent);

      // Update query data
      const currentTokens = tokensQuery.data || [];
      const newToken = {
        id: signedEvent.id,
        mint,
        proofs,
        del: delIds,
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

  // ========== Mint API Functions ==========

  // Request a Lightning payment quote from a mint
  const requestMintQuote = async (
    mintUrl: string,
    amount: number,
  ): Promise<MintQuoteResponse | null> => {
    try {
      const response = await fetch(`${mintUrl}/api/v1/mint/quote/${amount}`);
      if (!response.ok) {
        throw new Error(`Mint error: ${response.status}`);
      }

      const data = await response.json();

      const privateKey = await getSeckey();
      // Store quote ID in a Nostr event (optional)
      if (data.quote && privateKey) {
        const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14; // 2 weeks
        const event = {
          kind: 7374,
          content: nip44.encrypt(data.quote, hexToBytes(privateKey)),
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

      return data;
    } catch (error) {
      console.error("Error requesting mint quote:", error);
      toast.show("Failed to get quote from mint");
      return null;
    }
  };

  // Check the status of a pending mint quote
  const checkMintQuoteStatus = async (
    mintUrl: string,
    quoteId: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${mintUrl}/api/v1/mint/quote/status/${quoteId}`,
      );
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.paid === true;
    } catch (error) {
      console.error("Error checking quote status:", error);
      return false;
    }
  };

  // Claim tokens for a paid quote
  const claimMintTokens = async (
    mintUrl: string,
    quoteId: string,
  ): Promise<boolean> => {
    try {
      // Check if the quote is paid
      const isPaid = await checkMintQuoteStatus(mintUrl, quoteId);
      if (!isPaid) {
        toast.show("Payment has not been completed yet");
        return false;
      }

      // Request tokens
      const response = await fetch(
        `${mintUrl}/api/v1/mint/quote/tokens/${quoteId}`,
      );
      if (!response.ok) {
        throw new Error(`Mint error: ${response.status}`);
      }

      const data: {
        proofs: CashuProof[];
        paid: boolean;
        quoteId: string;
      } = await response.json();
      if (!data.proofs || data.proofs.length === 0) {
        throw new Error("No proofs received from mint");
      }

      // Add the tokens to our Nostr event
      const result = await addTokenEvent(mintUrl, data.proofs);

      // Record the transaction
      if (result.success && result.tokenId) {
        await recordTransaction(
          "in",
          data.proofs.reduce((sum, p) => sum + p.amount, 0),
          result.tokenId,
        );
      }

      return result.success;
    } catch (error) {
      console.error("Error claiming tokens:", error);
      toast.show("Failed to claim tokens from mint");
      return false;
    }
  };

  // Spend tokens API
  const spendTokens = async (
    amount: number,
    mintUrl?: string,
  ): Promise<{ success: boolean; proofs?: CashuProof[] }> => {
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
      proofsToSpend: CashuProof[];
      proofsToKeep: CashuProof[];
    }[] = [];

    let remaining = amount;

    // If mintUrl is specified, only use tokens from that mint
    const filteredTokens = mintUrl
      ? tokens.filter((t) => t.mint === mintUrl)
      : tokens;

    for (const token of filteredTokens) {
      if (remaining <= 0) break;

      const proofsToSpend: CashuProof[] = [];
      const proofsToKeep: CashuProof[] = [];

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

  // Melt tokens to pay a Lightning invoice
  const meltTokens = async (
    mintUrl: string,
    invoice: string,
    amount?: number,
  ): Promise<boolean> => {
    try {
      // Get tokens to spend
      let tokensToSpend: CashuProof[] = [];

      if (amount) {
        // Specific amount
        const spendResult = await spendTokens(amount, mintUrl);
        if (!spendResult.success || !spendResult.proofs) {
          return false;
        }
        tokensToSpend = spendResult.proofs;
      } else {
        // Automatically determine amount from invoice
        // First, decode the invoice to get amount
        const decodeResponse = await fetch(`${mintUrl}/api/v1/decode`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pr: invoice }),
        });

        if (!decodeResponse.ok) {
          throw new Error(`Mint error: ${decodeResponse.status}`);
        }

        const decodeData = await decodeResponse.json();
        const invoiceAmount = decodeData.amount;

        // Now spend the tokens
        const spendResult = await spendTokens(invoiceAmount, mintUrl);
        if (!spendResult.success || !spendResult.proofs) {
          return false;
        }
        tokensToSpend = spendResult.proofs;
      }

      // Send tokens to mint to pay the invoice
      const meltResponse = await fetch(`${mintUrl}/api/v1/melt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proofs: tokensToSpend,
          pr: invoice,
        }),
      });

      if (!meltResponse.ok) {
        throw new Error(`Mint error: ${meltResponse.status}`);
      }

      const meltData = await meltResponse.json();

      // If change is returned, add it back to our wallet
      if (meltData.change && meltData.change.length > 0) {
        await addTokenEvent(mintUrl, meltData.change);
      }

      return true;
    } catch (error) {
      console.error("Error melting tokens:", error);
      toast.show("Failed to pay Lightning invoice");
      return false;
    }
  };

  // Swap tokens within the same mint (for change or splitting)
  const swapTokens = async (
    mintUrl: string,
    proofs: CashuProof[],
    outputs: number[],
  ): Promise<boolean> => {
    try {
      // Send swap request to mint
      const swapResponse = await fetch(`${mintUrl}/api/v1/swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proofs,
          outputs,
        }),
      });

      if (!swapResponse.ok) {
        throw new Error(`Mint error: ${swapResponse.status}`);
      }

      const swapData = await swapResponse.json();

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

      // Add the new proofs to our wallet
      if (swapData.proofs && swapData.proofs.length > 0) {
        await addTokenEvent(mintUrl, swapData.proofs, deletedTokenIds);
      }

      return true;
    } catch (error) {
      console.error("Error swapping tokens:", error);
      toast.show("Failed to swap tokens");
      return false;
    }
  };

  // Check if a token is spent (validate it with the mint)
  const validateTokens = async (
    mintUrl: string,
    proofs: CashuProof[],
  ): Promise<boolean> => {
    try {
      const checkResponse = await fetch(`${mintUrl}/api/v1/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proofs }),
      });

      if (!checkResponse.ok) {
        throw new Error(`Mint error: ${checkResponse.status}`);
      }

      const checkData = await checkResponse.json();

      // If any proof is spent, we need to update our wallet
      const spentProofIds = Object.entries(checkData.states)
        .filter(([_, state]) => state === "spent")
        .map(([id, _]) => id);

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
  };
};
