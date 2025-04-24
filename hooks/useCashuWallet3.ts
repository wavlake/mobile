import { useState, useEffect, useCallback } from "react";
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

// NIP-60 and NIP-61 kinds
enum NostrKinds {
  WALLET_EVENT = 17375, // NIP-60: Replaceable wallet event
  TOKEN_EVENT = 7375, // NIP-60: Unspent proofs
  SPENDING_HISTORY = 7376, // NIP-60: Spending history
  QUOTE_STATE = 7374, // NIP-60: Quote state
  NUTZAP_INFO = 10019, // NIP-61: Nutzap informational event
  NUTZAP_EVENT = 9321, // NIP-61: Nutzap event
}

interface UseCashuWalletProps {
  defaultMintUrl?: string;
}

interface WalletData {
  mints: string[];
  privkey?: string;
}

interface TokenData {
  mint: string;
  proofs: Proof[];
  del?: string[];
}

interface ProofsByMint {
  [mintUrl: string]: Proof[];
}

interface CashuWalletState {
  wallets: Map<string, CashuWallet>;
  walletData?: WalletData;
  tokenData: TokenData[];
  proofsByMint: ProofsByMint;
  totalBalance: number;
  nutZapPubkey?: string;
}

export const useCashuWallet = ({
  defaultMintUrl,
}: UseCashuWalletProps = {}) => {
  const { querySync, publishEvent } = useNostrEvents();
  const { pubkey: userPubkey } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [state, setState] = useState<CashuWalletState>({
    wallets: new Map(),
    tokenData: [],
    proofsByMint: {},
    totalBalance: 0,
  });

  // Fetch wallet event (kind 17375)
  const { data: walletEvent, isLoading: isLoadingWallet } = useQuery({
    queryKey: ["cashu-wallet", userPubkey],
    queryFn: async () => {
      if (!userPubkey) return null;

      const events = await querySync({
        kinds: [NostrKinds.WALLET_EVENT],
        authors: [userPubkey],
        limit: 1,
      });

      return events?.[0] || null;
    },
    enabled: !!userPubkey,
  });

  // Fetch token events (kind 7375)
  const { data: tokenEvents, isLoading: isLoadingTokens } = useQuery({
    queryKey: ["cashu-tokens", userPubkey],
    queryFn: async () => {
      if (!userPubkey) return [];

      const events = await querySync({
        kinds: [NostrKinds.TOKEN_EVENT],
        authors: [userPubkey],
      });

      return events || [];
    },
    enabled: !!userPubkey,
  });

  // Fetch nutzap info event (kind 10019)
  const { data: nutzapInfoEvent } = useQuery({
    queryKey: ["cashu-nutzap-info", userPubkey],
    queryFn: async () => {
      if (!userPubkey) return null;

      const events = await querySync({
        kinds: [NostrKinds.NUTZAP_INFO],
        authors: [userPubkey],
        limit: 1,
      });

      return events?.[0] || null;
    },
    enabled: !!userPubkey,
  });

  // Fetch incoming nutzaps (kind 9321)
  const { data: incomingNutzaps } = useQuery({
    queryKey: ["cashu-nutzaps-incoming", userPubkey, state.walletData?.mints],
    queryFn: async () => {
      if (!userPubkey || !state.walletData?.mints?.length) return [];

      // Find the most recent spending history event
      const spendingEvents = await querySync({
        kinds: [NostrKinds.SPENDING_HISTORY],
        authors: [userPubkey],
        limit: 20,
      });

      // Extract the most recent timestamp from spending history events
      const latestTimestamp =
        spendingEvents.length > 0
          ? Math.max(...spendingEvents.map((e) => e.created_at))
          : 0;

      // Fetch nutzaps since the latest spending history event
      const events = await querySync({
        kinds: [NostrKinds.NUTZAP_EVENT],
        "#p": [userPubkey],
        "#u": state.walletData.mints,
        since: latestTimestamp,
      });

      return events || [];
    },
    enabled: !!userPubkey && !!state.walletData?.mints?.length,
  });

  // Decrypt wallet data
  useEffect(() => {
    const decryptWalletData = async () => {
      if (!walletEvent || !userPubkey) return;

      try {
        const seckey = await getSeckey();
        if (!seckey) {
          toast.show("Failed to get secret key", { type: "error" });
          return;
        }

        // Decrypt the wallet content
        const decrypted = await nip44.decrypt(
          hexToBytes(seckey),
          hexToBytes(walletEvent.pubkey),
          walletEvent.content,
        );

        if (!decrypted) {
          toast.show("Failed to decrypt wallet data", { type: "error" });
          return;
        }

        // Parse wallet data
        const walletData: WalletData = { mints: [] };

        // Parse the wallet content format from NIP-60
        // Format: [["privkey", "hexkey"], ["mint", "https://mint1"], ["mint", "https://mint2"]]
        JSON.parse(decrypted).forEach((item: string[]) => {
          if (item[0] === "privkey") {
            walletData.privkey = item[1];
          } else if (item[0] === "mint") {
            walletData.mints.push(item[1]);
          }
        });

        setState((prev) => ({ ...prev, walletData }));
      } catch (error) {
        console.error("Error decrypting wallet data:", error);
        toast.show("Error decrypting wallet data", { type: "error" });
      }
    };

    decryptWalletData();
  }, [walletEvent, userPubkey]);

  // Decrypt token data
  useEffect(() => {
    const decryptTokenEvents = async () => {
      if (!tokenEvents?.length || !userPubkey) return;

      try {
        const seckey = await getSeckey();
        if (!seckey) {
          toast.show("Failed to get secret key", { type: "error" });
          return;
        }

        const tokenData: TokenData[] = [];
        const proofsByMint: ProofsByMint = {};

        for (const event of tokenEvents) {
          try {
            // Decrypt the token content
            const decrypted = await nip44.decrypt(
              hexToBytes(seckey),
              hexToBytes(event.pubkey),
              event.content,
            );

            if (!decrypted) continue;

            const data = JSON.parse(decrypted) as TokenData;
            tokenData.push(data);

            // Organize proofs by mint
            if (!proofsByMint[data.mint]) {
              proofsByMint[data.mint] = [];
            }
            proofsByMint[data.mint] = [
              ...proofsByMint[data.mint],
              ...data.proofs,
            ];
          } catch (e) {
            console.error("Error decrypting token event:", e);
          }
        }

        // Calculate total balance
        let totalBalance = 0;
        Object.values(proofsByMint).forEach((proofs) => {
          proofs.forEach((proof) => {
            totalBalance += proof.amount;
          });
        });

        setState((prev) => ({
          ...prev,
          tokenData,
          proofsByMint,
          totalBalance,
        }));
      } catch (error) {
        console.error("Error decrypting token events:", error);
        toast.show("Error decrypting token events", { type: "error" });
      }
    };

    decryptTokenEvents();
  }, [tokenEvents, userPubkey]);

  // Process nutzap info event
  useEffect(() => {
    if (!nutzapInfoEvent) return;

    // Extract the P2PK pubkey from nutzap info event
    const pubkeyTag = nutzapInfoEvent.tags.find((t) => t[0] === "pubkey");
    if (pubkeyTag && pubkeyTag[1]) {
      setState((prev) => ({ ...prev, nutZapPubkey: pubkeyTag[1] }));
    }
  }, [nutzapInfoEvent]);

  // Initialize CashuWallet instances
  useEffect(() => {
    const initializeWallets = async () => {
      if (!state.walletData?.mints.length) return;

      const wallets = new Map<string, CashuWallet>();

      for (const mintUrl of state.walletData.mints) {
        try {
          const mint = new CashuMint(mintUrl);
          const wallet = new CashuWallet(mint);
          await wallet.loadMint();
          wallets.set(mintUrl, wallet);
        } catch (error) {
          console.error(
            `Failed to initialize wallet for mint ${mintUrl}:`,
            error,
          );
        }
      }

      setState((prev) => ({ ...prev, wallets }));
    };

    initializeWallets();
  }, [state.walletData?.mints]);

  // Process incoming nutzaps
  useEffect(() => {
    const processNutzaps = async () => {
      if (
        !incomingNutzaps?.length ||
        !state.walletData?.privkey ||
        !state.wallets.size
      )
        return;

      for (const nutzap of incomingNutzaps) {
        try {
          // Extract mint URL
          const mintUrlTag = nutzap.tags.find((t) => t[0] === "u");
          if (!mintUrlTag || !mintUrlTag[1]) continue;

          const mintUrl = mintUrlTag[1];
          const wallet = state.wallets.get(mintUrl);
          if (!wallet) continue;

          // Extract proofs
          const proofTags = nutzap.tags.filter((t) => t[0] === "proof");
          if (!proofTags.length) continue;

          const proofs: Proof[] = proofTags.map((t) => JSON.parse(t[1]));

          // Receive the nutzaps (tokens) with P2PK private key
          const receivedProofs = await wallet.receiveP2PKTokens(
            proofs,
            state.walletData.privkey,
          );

          if (receivedProofs.length > 0) {
            // Store the received proofs
            await storeProofs(mintUrl, receivedProofs, []);

            // Create spending history event
            await createSpendingHistoryEvent("in", receivedProofs, nutzap.id);

            // Recalculate total balance
            setState((prev) => {
              const updatedProofsByMint = { ...prev.proofsByMint };
              if (!updatedProofsByMint[mintUrl]) {
                updatedProofsByMint[mintUrl] = [];
              }
              updatedProofsByMint[mintUrl] = [
                ...updatedProofsByMint[mintUrl],
                ...receivedProofs,
              ];

              // Calculate new total balance
              let totalBalance = 0;
              Object.values(updatedProofsByMint).forEach((proofs) => {
                proofs.forEach((proof) => {
                  totalBalance += proof.amount;
                });
              });

              return {
                ...prev,
                proofsByMint: updatedProofsByMint,
                totalBalance,
              };
            });

            toast.show(
              `Received ${receivedProofs.length} proofs as a nutzap!`,
              { type: "success" },
            );
          }
        } catch (error) {
          console.error("Failed to process nutzap:", error);
        }
      }
    };

    processNutzaps();
  }, [incomingNutzaps, state.walletData?.privkey, state.wallets]);

  // Initialize wallet if not exists
  const initializeWallet = useCallback(
    async (mints: string[] = []) => {
      if (!userPubkey) {
        toast.show("User not authenticated", { type: "error" });
        return;
      }

      try {
        // Generate a new private key for P2PK operations
        const randomPrivKey = window.crypto.getRandomValues(new Uint8Array(32));
        const privKeyHex = Array.from(randomPrivKey)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        // Calculate the corresponding public key (would normally use a library function)
        // For demo purposes, we'll just use a placeholder
        const pubKeyHex =
          "02" +
          Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        // Default mint if none provided
        const allMints =
          mints.length > 0
            ? mints
            : defaultMintUrl
            ? [defaultMintUrl]
            : ["https://8333.space:3338"];

        // Create wallet data
        const walletData: WalletData = {
          mints: allMints,
          privkey: privKeyHex,
        };

        // Encrypt wallet data
        const seckey = await getSeckey();
        const encryptedContent = await nip44.encrypt(
          hexToBytes(seckey),
          hexToBytes(userPubkey),
          JSON.stringify([
            ["privkey", privKeyHex],
            ...allMints.map((mint) => ["mint", mint]),
          ]),
        );

        // Create wallet event
        const event = {
          kind: NostrKinds.WALLET_EVENT,
          content: encryptedContent,
          tags: [],
          created_at: Math.floor(Date.now() / 1000),
        };

        // Sign and publish event
        const signedEvent = await signEvent(event);
        await publishEvent(signedEvent);

        // Create nutzap info event
        const nutzapInfoEvent = {
          kind: NostrKinds.NUTZAP_INFO,
          content: "",
          tags: [
            ["pubkey", pubKeyHex],
            ...allMints.map((mint) => ["mint", mint]),
          ],
          created_at: Math.floor(Date.now() / 1000),
        };

        // Sign and publish nutzap info event
        const signedNutzapEvent = await signEvent(nutzapInfoEvent);
        await publishEvent(signedNutzapEvent);

        // Initialize wallets
        const wallets = new Map<string, CashuWallet>();
        for (const mintUrl of allMints) {
          try {
            const mint = new CashuMint(mintUrl);
            const wallet = new CashuWallet(mint);
            await wallet.loadMint();
            wallets.set(mintUrl, wallet);
          } catch (error) {
            console.error(
              `Failed to initialize wallet for mint ${mintUrl}:`,
              error,
            );
          }
        }

        // Update state
        setState((prev) => ({
          ...prev,
          walletData,
          wallets,
          nutZapPubkey: pubKeyHex,
        }));

        // Invalidate queries to reload data
        queryClient.invalidateQueries(["cashu-wallet", userPubkey]);
        queryClient.invalidateQueries(["cashu-nutzap-info", userPubkey]);

        toast.show("Wallet initialized successfully", { type: "success" });
        return true;
      } catch (error) {
        console.error("Failed to initialize wallet:", error);
        toast.show("Failed to initialize wallet", { type: "error" });
        return false;
      }
    },
    [userPubkey, defaultMintUrl],
  );

  // Store proofs to nostr
  const storeProofs = useCallback(
    async (
      mintUrl: string,
      proofs: Proof[],
      deletedEventIds: string[] = [],
    ) => {
      if (!userPubkey) {
        toast.show("User not authenticated", { type: "error" });
        return false;
      }

      try {
        // Create token data
        const tokenData: TokenData = {
          mint: mintUrl,
          proofs,
          del: deletedEventIds.length > 0 ? deletedEventIds : undefined,
        };

        // Encrypt token data
        const seckey = await getSeckey();
        const encryptedContent = await nip44.encrypt(
          hexToBytes(seckey),
          hexToBytes(userPubkey),
          JSON.stringify(tokenData),
        );

        // Create token event
        const event = {
          kind: NostrKinds.TOKEN_EVENT,
          content: encryptedContent,
          tags: [],
          created_at: Math.floor(Date.now() / 1000),
        };

        // Sign and publish event
        const signedEvent = await signEvent(event);
        const { id: eventId } = await publishEvent(signedEvent);

        // Delete the token events that were used
        if (deletedEventIds.length > 0) {
          // Create delete event with 'k' tag for 7375
          const deleteEvent = {
            kind: 5, // NIP-09 delete event
            content: "",
            tags: [
              ["k", NostrKinds.TOKEN_EVENT.toString()],
              ...deletedEventIds.map((id) => ["e", id]),
            ],
            created_at: Math.floor(Date.now() / 1000),
          };

          // Sign and publish delete event
          const signedDeleteEvent = await signEvent(deleteEvent);
          await publishEvent(signedDeleteEvent);
        }

        // Update query cache
        queryClient.invalidateQueries(["cashu-tokens", userPubkey]);

        return eventId;
      } catch (error) {
        console.error("Failed to store proofs:", error);
        toast.show("Failed to store proofs", { type: "error" });
        return false;
      }
    },
    [userPubkey],
  );

  // Create spending history event
  const createSpendingHistoryEvent = useCallback(
    async (
      direction: "in" | "out",
      proofs: Proof[],
      relatedEventId?: string,
      createdTokenEventId?: string,
      destroyedTokenEventId?: string,
    ) => {
      if (!userPubkey) {
        toast.show("User not authenticated", { type: "error" });
        return false;
      }

      try {
        // Calculate total amount
        const amount = proofs.reduce((sum, proof) => sum + proof.amount, 0);

        // Create content array
        const contentArray: any[] = [
          ["direction", direction],
          ["amount", amount.toString()],
        ];

        // Add e tags for created/destroyed events if provided
        if (createdTokenEventId) {
          contentArray.push(["e", createdTokenEventId, "", "created"]);
        }

        if (destroyedTokenEventId) {
          contentArray.push(["e", destroyedTokenEventId, "", "destroyed"]);
        }

        // Encrypt content
        const seckey = await getSeckey();
        const encryptedContent = await nip44.encrypt(
          hexToBytes(seckey),
          hexToBytes(userPubkey),
          JSON.stringify(contentArray),
        );

        // Create tags array - keep the nutzap redemption tag unencrypted
        const tags: string[][] = [];

        if (relatedEventId) {
          tags.push(["e", relatedEventId, "", "redeemed"]);
        }

        // Create spending history event
        const event = {
          kind: NostrKinds.SPENDING_HISTORY,
          content: encryptedContent,
          tags,
          created_at: Math.floor(Date.now() / 1000),
        };

        // Sign and publish event
        const signedEvent = await signEvent(event);
        await publishEvent(signedEvent);

        return true;
      } catch (error) {
        console.error("Failed to create spending history:", error);
        toast.show("Failed to create spending history", { type: "error" });
        return false;
      }
    },
    [userPubkey],
  );

  // Mint tokens flow
  const mintTokens = useCallback(
    async (mintUrl: string, amount: number) => {
      if (!userPubkey) {
        toast.show("User not authenticated", { type: "error" });
        return null;
      }

      // Check if wallet exists
      if (!state.walletData || !state.wallets.has(mintUrl)) {
        toast.show("Wallet not initialized for this mint", { type: "error" });
        return null;
      }

      try {
        const wallet = state.wallets.get(mintUrl)!;

        // Create mint quote
        const mintQuote = await wallet.createMintQuote(amount);

        // Return the quote for payment
        return {
          quote: mintQuote,
          completeMinting: async () => {
            // Check if quote was paid
            const checkedQuote = await wallet.checkMintQuote(mintQuote.quote);

            if (checkedQuote.state !== MintQuoteState.PAID) {
              toast.show("Quote has not been paid yet", { type: "error" });
              return null;
            }

            // Mint the proofs
            const proofs = await wallet.mintProofs(amount, mintQuote.quote);

            // Store the proofs
            await storeProofs(mintUrl, proofs);

            // Create spending history
            await createSpendingHistoryEvent("in", proofs);

            // Update state
            setState((prev) => {
              const updatedProofsByMint = { ...prev.proofsByMint };
              if (!updatedProofsByMint[mintUrl]) {
                updatedProofsByMint[mintUrl] = [];
              }
              updatedProofsByMint[mintUrl] = [
                ...updatedProofsByMint[mintUrl],
                ...proofs,
              ];

              return {
                ...prev,
                proofsByMint: updatedProofsByMint,
                totalBalance: prev.totalBalance + amount,
              };
            });

            return proofs;
          },
        };
      } catch (error) {
        console.error("Failed to mint tokens:", error);
        toast.show("Failed to mint tokens", { type: "error" });
        return null;
      }
    },
    [
      userPubkey,
      state.walletData,
      state.wallets,
      storeProofs,
      createSpendingHistoryEvent,
    ],
  );

  // Send tokens (get encoded token)
  const sendTokens = useCallback(
    async (mintUrl: string, amount: number) => {
      if (!userPubkey) {
        toast.show("User not authenticated", { type: "error" });
        return null;
      }

      // Check if wallet exists
      if (!state.walletData || !state.wallets.has(mintUrl)) {
        toast.show("Wallet not initialized for this mint", { type: "error" });
        return null;
      }

      // Check if we have enough balance
      const mintProofs = state.proofsByMint[mintUrl] || [];
      const mintBalance = mintProofs.reduce((sum, p) => sum + p.amount, 0);

      if (mintBalance < amount) {
        toast.show(`Insufficient balance (${mintBalance} < ${amount})`, {
          type: "error",
        });
        return null;
      }

      try {
        const wallet = state.wallets.get(mintUrl)!;

        // Find token events that contain the proofs we need
        const eventsToDelete: string[] = [];
        const proofsToUse: Proof[] = [];
        let amountCollected = 0;

        if (tokenEvents) {
          for (const event of tokenEvents) {
            try {
              // Decrypt the token content
              const seckey = await getSeckey();
              const decrypted = await nip44.decrypt(
                hexToBytes(seckey),
                hexToBytes(event.pubkey),
                event.content,
              );

              if (!decrypted) continue;

              const data = JSON.parse(decrypted) as TokenData;

              // Only use tokens from the target mint
              if (data.mint !== mintUrl) continue;

              // Add proofs from this event until we have enough
              for (const proof of data.proofs) {
                proofsToUse.push(proof);
                amountCollected += proof.amount;

                // Mark this event for deletion
                if (!eventsToDelete.includes(event.id)) {
                  eventsToDelete.push(event.id);
                }

                if (amountCollected >= amount) break;
              }

              if (amountCollected >= amount) break;
            } catch (e) {
              console.error("Error processing token event:", e);
            }
          }
        }

        if (amountCollected < amount) {
          toast.show("Could not collect enough proofs", { type: "error" });
          return null;
        }

        // Split the tokens
        const { send, keep } = await wallet.send(amount, proofsToUse);

        // Create token to send
        const token = getEncodedTokenV4({
          token: [{ mint: mintUrl, proofs: send }],
        });

        // Store the change (keep proofs)
        if (keep.length > 0) {
          await storeProofs(mintUrl, keep, eventsToDelete);
        }

        // Create spending history
        await createSpendingHistoryEvent(
          "out",
          send,
          undefined,
          undefined,
          eventsToDelete[0],
        );

        // Update state
        setState((prev) => {
          // Remove spent proofs
          const updatedProofsByMint = { ...prev.proofsByMint };
          updatedProofsByMint[mintUrl] = (
            updatedProofsByMint[mintUrl] || []
          ).filter(
            (p) => !proofsToUse.some((used) => used.secret === p.secret),
          );

          // Add change proofs
          if (keep.length > 0) {
            updatedProofsByMint[mintUrl] = [
              ...updatedProofsByMint[mintUrl],
              ...keep,
            ];
          }

          // Recalculate balance
          let totalBalance = 0;
          Object.values(updatedProofsByMint).forEach((proofs) => {
            proofs.forEach((proof) => {
              totalBalance += proof.amount;
            });
          });

          return {
            ...prev,
            proofsByMint: updatedProofsByMint,
            totalBalance,
          };
        });

        return token;
      } catch (error) {
        console.error("Failed to send tokens:", error);
        toast.show("Failed to send tokens", { type: "error" });
        return null;
      }
    },
    [
      userPubkey,
      state.walletData,
      state.wallets,
      state.proofsByMint,
      tokenEvents,
      storeProofs,
      createSpendingHistoryEvent,
    ],
  );

  // Receive tokens
  const receiveTokens = useCallback(
    async (token: string) => {
      if (!userPubkey) {
        toast.show("User not authenticated", { type: "error" });
        return null;
      }

      try {
        // Parse the token to check the mint
        // For real implementation, use a proper function to decode the token
        // For this example we assume it's already a v4 token
        const tokenData = JSON.parse(
          token.startsWith("cashuA") ? token.substring(6) : token,
        );

        // Check if we have a wallet for this mint
        const mintUrl = tokenData.token[0].mint;

        if (!state.walletData || !state.wallets.has(mintUrl)) {
          toast.show("Wallet not initialized for this mint", { type: "error" });
          return null;
        }

        const wallet = state.wallets.get(mintUrl)!;

        // Receive the token
        const receivedProofs = await wallet.receive(token);

        if (receivedProofs.length === 0) {
          toast.show("No valid proofs found in token", { type: "error" });
          return null;
        }

        // Store the proofs
        await storeProofs(mintUrl, receivedProofs);

        // Create spending history
        await createSpendingHistoryEvent("in", receivedProofs);

        // Update state
        setState((prev) => {
          const updatedProofsByMint = { ...prev.proofsByMint };
          if (!updatedProofsByMint[mintUrl]) {
            updatedProofsByMint[mintUrl] = [];
          }
          updatedProofsByMint[mintUrl] = [
            ...updatedProofsByMint[mintUrl],
            ...receivedProofs,
          ];

          // Calculate total amount received
          const amountReceived = receivedProofs.reduce(
            (sum, p) => sum + p.amount,
            0,
          );

          return {
            ...prev,
            proofsByMint: updatedProofsByMint,
            totalBalance: prev.totalBalance + amountReceived,
          };
        });

        return receivedProofs;
      } catch (error) {
        console.error("Failed to receive tokens:", error);
        toast.show("Failed to receive tokens", { type: "error" });
        return null;
      }
    },
    [
      userPubkey,
      state.walletData,
      state.wallets,
      storeProofs,
      createSpendingHistoryEvent,
    ],
  );

  // Send nutzap (NIP-61)
  const sendNutzap = useCallback(
    async (
      recipientPubkey: string,
      amount: number,
      eventId?: string, // The event being nutzapped
      comment?: string,
    ) => {
      if (!userPubkey) {
        toast.show("User not authenticated", { type: "error" });
        return null;
      }

      try {
        // Fetch recipient's nutzap info to get mint and pubkey
        const recipientNutzapEvents = await querySync({
          kinds: [NostrKinds.NUTZAP_INFO],
          authors: [recipientPubkey],
          limit: 1,
        });

        if (!recipientNutzapEvents || recipientNutzapEvents.length === 0) {
          toast.show("Recipient does not have nutzap info", { type: "error" });
          return null;
        }

        const recipientNutzapInfo = recipientNutzapEvents[0];

        // Extract recipient's P2PK pubkey
        const pubkeyTag = recipientNutzapInfo.tags.find(
          (t) => t[0] === "pubkey",
        );
        if (!pubkeyTag || !pubkeyTag[1]) {
          toast.show("Recipient does not have a P2PK pubkey", {
            type: "error",
          });
          return null;
        }

        const recipientP2PKPubkey = pubkeyTag[1];

        // Extract recipient's trusted mints
        const mintTags = recipientNutzapInfo.tags.filter(
          (t) => t[0] === "mint",
        );
        if (mintTags.length === 0) {
          toast.show("Recipient does not have any trusted mints", {
            type: "error",
          });
          return null;
        }

        // Find a mint that both user and recipient trust
        let commonMint: string | null = null;
        let userWallet: CashuWallet | null = null;

        for (const mintTag of mintTags) {
          const mintUrl = mintTag[1];
          if (state.wallets.has(mintUrl)) {
            commonMint = mintUrl;
            userWallet = state.wallets.get(mintUrl)!;
            break;
          }
        }

        if (!commonMint || !userWallet) {
          toast.show("No common mint found with recipient", { type: "error" });
          return null;
        }

        // Check if we have enough balance
        const mintProofs = state.proofsByMint[commonMint] || [];
        const mintBalance = mintProofs.reduce((sum, p) => sum + p.amount, 0);

        if (mintBalance < amount) {
          toast.show(`Insufficient balance (${mintBalance} < ${amount})`, {
            type: "error",
          });
          return null;
        }

        // Find token events that contain the proofs we need
        const eventsToDelete: string[] = [];
        const proofsToUse: Proof[] = [];
        let amountCollected = 0;

        if (tokenEvents) {
          for (const event of tokenEvents) {
            try {
              // Decrypt the token content
              const seckey = await getSeckey();
              const decrypted = await nip44.decrypt(
                hexToBytes(seckey),
                hexToBytes(event.pubkey),
                event.content,
              );

              if (!decrypted) continue;

              const data = JSON.parse(decrypted) as TokenData;

              // Only use tokens from the common mint
              if (data.mint !== commonMint) continue;

              // Add proofs from this event until we have enough
              for (const proof of data.proofs) {
                proofsToUse.push(proof);
                amountCollected += proof.amount;

                // Mark this event for deletion
                if (!eventsToDelete.includes(event.id)) {
                  eventsToDelete.push(event.id);
                }

                if (amountCollected >= amount) break;
              }

              if (amountCollected >= amount) break;
            } catch (e) {
              console.error("Error processing token event:", e);
            }
          }
        }

        if (amountCollected < amount) {
          toast.show("Could not collect enough proofs", { type: "error" });
          return null;
        }

        // Lock the tokens to recipient's P2PK pubkey
        const { send, keep } = await userWallet.send(amount, proofsToUse);

        // Create P2PK locked outputs for recipient
        const lockedProofs = await userWallet.lockP2PKOutputs(
          send,
          recipientP2PKPubkey,
        );

        // Prepare nutzap event tags
        const tags: string[][] = [
          ["p", recipientPubkey],
          ["u", commonMint],
        ];

        // Add event tag if nutzapping a specific event
        if (eventId) {
          tags.push(["e", eventId]);
        }

        // Add proof tags
        for (const proof of lockedProofs) {
          tags.push(["proof", JSON.stringify(proof)]);
        }

        // Create nutzap event
        const nutzapEvent = {
          kind: NostrKinds.NUTZAP_EVENT,
          content: comment || "",
          tags,
          created_at: Math.floor(Date.now() / 1000),
        };

        // Sign and publish event
        const signedEvent = await signEvent(nutzapEvent);
        const { id: nutzapEventId } = await publishEvent(signedEvent);

        // Store the change proofs
        if (keep.length > 0) {
          await storeProofs(commonMint, keep, eventsToDelete);
        }

        // Create spending history
        await createSpendingHistoryEvent(
          "out",
          send,
          undefined,
          undefined,
          eventsToDelete[0],
        );

        // Update state
        setState((prev) => {
          // Remove spent proofs
          const updatedProofsByMint = { ...prev.proofsByMint };
          updatedProofsByMint[commonMint!] = (
            updatedProofsByMint[commonMint!] || []
          ).filter(
            (p) => !proofsToUse.some((used) => used.secret === p.secret),
          );

          // Add change proofs
          if (keep.length > 0) {
            updatedProofsByMint[commonMint!] = [
              ...updatedProofsByMint[commonMint!],
              ...keep,
            ];
          }

          // Recalculate balance
          let totalBalance = 0;
          Object.values(updatedProofsByMint).forEach((proofs) => {
            proofs.forEach((proof) => {
              totalBalance += proof.amount;
            });
          });

          return {
            ...prev,
            proofsByMint: updatedProofsByMint,
            totalBalance,
          };
        });

        return nutzapEventId;
      } catch (error) {
        console.error("Failed to send nutzap:", error);
        toast.show("Failed to send nutzap", { type: "error" });
        return null;
      }
    },
    [
      userPubkey,
      state.wallets,
      state.proofsByMint,
      tokenEvents,
      querySync,
      storeProofs,
      createSpendingHistoryEvent,
    ],
  );

  // Melt tokens (pay invoice)
  const meltTokens = useCallback(
    async (mintUrl: string, invoice: string) => {
      if (!userPubkey) {
        toast.show("User not authenticated", { type: "error" });
        return null;
      }

      // Check if wallet exists
      if (!state.walletData || !state.wallets.has(mintUrl)) {
        toast.show("Wallet not initialized for this mint", { type: "error" });
        return null;
      }

      try {
        const wallet = state.wallets.get(mintUrl)!;

        // Create melt quote
        const meltQuote = await wallet.createMeltQuote(invoice);

        // Check if we have enough balance
        const amountToSend = meltQuote.amount + meltQuote.fee_reserve;
        const mintProofs = state.proofsByMint[mintUrl] || [];
        const mintBalance = mintProofs.reduce((sum, p) => sum + p.amount, 0);

        if (mintBalance < amountToSend) {
          toast.show(
            `Insufficient balance (${mintBalance} < ${amountToSend})`,
            { type: "error" },
          );
          return null;
        }

        // Find token events that contain the proofs we need
        const eventsToDelete: string[] = [];
        const proofsToUse: Proof[] = [];
        let amountCollected = 0;

        if (tokenEvents) {
          for (const event of tokenEvents) {
            try {
              // Decrypt the token content
              const seckey = await getSeckey();
              const decrypted = await nip44.decrypt(
                hexToBytes(seckey),
                hexToBytes(event.pubkey),
                event.content,
              );

              if (!decrypted) continue;

              const data = JSON.parse(decrypted) as TokenData;

              // Only use tokens from the target mint
              if (data.mint !== mintUrl) continue;

              // Add proofs from this event until we have enough
              for (const proof of data.proofs) {
                proofsToUse.push(proof);
                amountCollected += proof.amount;

                // Mark this event for deletion
                if (!eventsToDelete.includes(event.id)) {
                  eventsToDelete.push(event.id);
                }

                if (amountCollected >= amountToSend) break;
              }

              if (amountCollected >= amountToSend) break;
            } catch (e) {
              console.error("Error processing token event:", e);
            }
          }
        }

        if (amountCollected < amountToSend) {
          toast.show("Could not collect enough proofs", { type: "error" });
          return null;
        }

        // Split the tokens
        const { send, keep } = await wallet.send(amountToSend, proofsToUse, {
          includeFees: true,
        });

        // Melt the proofs (pay the invoice)
        const meltResponse = await wallet.meltProofs(meltQuote, send);

        // Store the change proofs
        const allChangeProofs = [...keep];
        if (meltResponse.change && meltResponse.change.length > 0) {
          allChangeProofs.push(...meltResponse.change);
        }

        if (allChangeProofs.length > 0) {
          await storeProofs(mintUrl, allChangeProofs, eventsToDelete);
        }

        // Create spending history
        await createSpendingHistoryEvent(
          "out",
          send,
          undefined,
          undefined,
          eventsToDelete[0],
        );

        // Update state
        setState((prev) => {
          // Remove spent proofs
          const updatedProofsByMint = { ...prev.proofsByMint };
          updatedProofsByMint[mintUrl] = (
            updatedProofsByMint[mintUrl] || []
          ).filter(
            (p) => !proofsToUse.some((used) => used.secret === p.secret),
          );

          // Add change proofs
          if (allChangeProofs.length > 0) {
            updatedProofsByMint[mintUrl] = [
              ...updatedProofsByMint[mintUrl],
              ...allChangeProofs,
            ];
          }

          // Recalculate balance
          let totalBalance = 0;
          Object.values(updatedProofsByMint).forEach((proofs) => {
            proofs.forEach((proof) => {
              totalBalance += proof.amount;
            });
          });

          return {
            ...prev,
            proofsByMint: updatedProofsByMint,
            totalBalance,
          };
        });

        return meltResponse;
      } catch (error) {
        console.error("Failed to melt tokens:", error);
        toast.show("Failed to melt tokens", { type: "error" });
        return null;
      }
    },
    [
      userPubkey,
      state.walletData,
      state.wallets,
      state.proofsByMint,
      tokenEvents,
      storeProofs,
      createSpendingHistoryEvent,
    ],
  );

  // Check if proofs are spent
  const checkProofsStatus = useCallback(
    async (mintUrl: string, proofs: Proof[]) => {
      if (!state.walletData || !state.wallets.has(mintUrl)) {
        toast.show("Wallet not initialized for this mint", { type: "error" });
        return null;
      }

      try {
        const wallet = state.wallets.get(mintUrl)!;

        // Check proofs state
        const checkResult = await wallet.checkProofsSpent(proofs);

        // If some proofs are spent, update our state
        if (checkResult.some((res) => res.state === CheckStateEnum.SPENT)) {
          // Get unspent proofs
          const unspentProofs = proofs.filter(
            (_, i) => checkResult[i].state !== CheckStateEnum.SPENT,
          );

          // Update state to remove spent proofs
          if (unspentProofs.length !== proofs.length) {
            setState((prev) => {
              const updatedProofsByMint = { ...prev.proofsByMint };
              updatedProofsByMint[mintUrl] = (
                updatedProofsByMint[mintUrl] || []
              ).filter(
                (p) =>
                  !proofs.some(
                    (prf, i) =>
                      prf.secret === p.secret &&
                      checkResult[i].state === CheckStateEnum.SPENT,
                  ),
              );

              // Recalculate balance
              let totalBalance = 0;
              Object.values(updatedProofsByMint).forEach((proofs) => {
                proofs.forEach((proof) => {
                  totalBalance += proof.amount;
                });
              });

              return {
                ...prev,
                proofsByMint: updatedProofsByMint,
                totalBalance,
              };
            });

            // Update stored proofs
            const eventsToDelete: string[] = [];
            if (tokenEvents) {
              // Find events that contain spent proofs
              for (const event of tokenEvents) {
                try {
                  const seckey = await getSeckey();
                  const decrypted = await nip44.decrypt(
                    hexToBytes(seckey),
                    hexToBytes(event.pubkey),
                    event.content,
                  );

                  if (!decrypted) continue;

                  const data = JSON.parse(decrypted) as TokenData;

                  if (data.mint !== mintUrl) continue;

                  const hasSpentProof = data.proofs.some((p) =>
                    proofs.some(
                      (prf, i) =>
                        prf.secret === p.secret &&
                        checkResult[i].state === CheckStateEnum.SPENT,
                    ),
                  );

                  if (hasSpentProof) {
                    eventsToDelete.push(event.id);

                    // Store remaining unspent proofs from this event
                    const remainingProofs = data.proofs.filter(
                      (p) =>
                        !proofs.some(
                          (prf, i) =>
                            prf.secret === p.secret &&
                            checkResult[i].state === CheckStateEnum.SPENT,
                        ),
                    );

                    if (remainingProofs.length > 0) {
                      await storeProofs(mintUrl, remainingProofs, [event.id]);
                    }
                  }
                } catch (e) {
                  console.error("Error processing token event:", e);
                }
              }
            }
          }
        }

        return checkResult;
      } catch (error) {
        console.error("Failed to check proofs status:", error);
        toast.show("Failed to check proofs status", { type: "error" });
        return null;
      }
    },
    [state.walletData, state.wallets, tokenEvents, storeProofs],
  );

  // Add a new mint to the wallet
  const addMint = useCallback(
    async (mintUrl: string) => {
      if (!userPubkey || !state.walletData) {
        toast.show("Wallet not initialized", { type: "error" });
        return false;
      }

      // Check if mint already exists
      if (state.walletData.mints.includes(mintUrl)) {
        toast.show("Mint already added", { type: "info" });
        return true;
      }

      try {
        // Initialize wallet for the new mint
        const mint = new CashuMint(mintUrl);
        const wallet = new CashuWallet(mint);
        await wallet.loadMint();

        // Update wallet event
        const updatedMints = [...state.walletData.mints, mintUrl];

        // Create updated wallet data
        const updatedWalletData: WalletData = {
          ...state.walletData,
          mints: updatedMints,
        };

        // Encrypt wallet data
        const seckey = await getSeckey();
        const encryptedContent = await nip44.encrypt(
          hexToBytes(seckey),
          hexToBytes(userPubkey),
          JSON.stringify([
            ["privkey", state.walletData.privkey!],
            ...updatedMints.map((mint) => ["mint", mint]),
          ]),
        );

        // Create updated wallet event
        const event = {
          kind: NostrKinds.WALLET_EVENT,
          content: encryptedContent,
          tags: [],
          created_at: Math.floor(Date.now() / 1000),
        };

        // Sign and publish event
        const signedEvent = await signEvent(event);
        await publishEvent(signedEvent);

        // Update nutzap info event
        if (state.nutZapPubkey) {
          const nutzapInfoEvent = {
            kind: NostrKinds.NUTZAP_INFO,
            content: "",
            tags: [
              ["pubkey", state.nutZapPubkey],
              ...updatedMints.map((mint) => ["mint", mint]),
            ],
            created_at: Math.floor(Date.now() / 1000),
          };

          // Sign and publish nutzap info event
          const signedNutzapEvent = await signEvent(nutzapInfoEvent);
          await publishEvent(signedNutzapEvent);
        }

        // Update state
        setState((prev) => {
          const updatedWallets = new Map(prev.wallets);
          updatedWallets.set(mintUrl, wallet);

          return {
            ...prev,
            walletData: updatedWalletData,
            wallets: updatedWallets,
          };
        });

        // Invalidate queries to reload data
        queryClient.invalidateQueries(["cashu-wallet", userPubkey]);
        queryClient.invalidateQueries(["cashu-nutzap-info", userPubkey]);

        toast.show("Mint added successfully", { type: "success" });
        return true;
      } catch (error) {
        console.error("Failed to add mint:", error);
        toast.show("Failed to add mint", { type: "error" });
        return false;
      }
    },
    [userPubkey, state.walletData, state.nutZapPubkey],
  );

  // Return the hook interface
  return {
    isInitialized: !!state.walletData,
    isLoading: isLoadingWallet || isLoadingTokens,
    walletData: state.walletData,
    mints: state.walletData?.mints || [],
    proofsByMint: state.proofsByMint,
    totalBalance: state.totalBalance,
    initializeWallet,
    mintTokens,
    sendTokens,
    receiveTokens,
    sendNutzap,
    meltTokens,
    checkProofsStatus,
    addMint,
  };
};
