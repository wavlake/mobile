import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNostrEvents } from "@/providers";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { getSeckey, signEvent } from "@/utils";
import { hexToBytes } from "@noble/hashes/utils";
import { nip44 } from "nostr-tools";
import { useCashuMint } from "./useCashuMint";
import { useCashuProofs } from "./useCashuProofs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CASHU_TOKEN_EVENT_KIND = 1112; // Custom kind for Cashu token transfers

export function useCashuP2P(mintUrl?: string) {
  const { querySync, publishEvent } = useNostrEvents();
  const { pubkey: userPubkey } = useAuth();
  const toast = useToast();
  const { actions: walletActions } = useCashuMint({ mintUrl });
  const {
    proofs,
    totalBalance,
    actions: proofsActions,
  } = useCashuProofs(mintUrl);

  // Send tokens to a recipient's Nostr pubkey
  const sendTokensViaNostr = useMutation({
    mutationFn: async ({
      amount,
      recipientPubkey,
      description,
    }: {
      amount: number;
      recipientPubkey: string;
      description?: string;
    }) => {
      if (!proofs || proofs.length === 0) {
        throw new Error("No tokens available to send");
      }

      if (totalBalance < amount) {
        throw new Error(
          `Insufficient funds. Need ${amount} sats but only have ${totalBalance} sats`,
        );
      }

      // Split the tokens
      const { send, keep } = await walletActions.sendTokens.mutateAsync({
        amount,
        proofs,
      });

      // Get the encoded token
      const tokenToSend = {
        mint: mintUrl || "",
        proofs: send,
      };

      // Encode the token
      const encodedToken =
        walletActions.wallet?.getEncodedToken(tokenToSend) || "";

      // Get the user's secret key for encryption
      const seckey = await getSeckey();
      if (!seckey) {
        throw new Error("Failed to retrieve secret key");
      }
      const seckeyBytes = hexToBytes(seckey);

      // Encrypt the token for the recipient
      const encryptedContent = await nip44.encrypt(
        encodedToken,
        seckeyBytes,
        hexToBytes(recipientPubkey),
      );

      // Create and sign the Nostr event
      const event = {
        kind: CASHU_TOKEN_EVENT_KIND,
        pubkey: userPubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ["p", recipientPubkey],
          ["amount", amount.toString()],
          ["mint", mintUrl || ""],
          ...(description ? [["description", description]] : []),
        ],
        content: encryptedContent,
      };

      // Sign the event
      const signedEvent = await signEvent(event);

      // Publish the event
      await publishEvent(signedEvent);

      // Update stored proofs (remove sent ones)
      await proofsActions.updateProofs.mutateAsync(keep);

      return {
        success: true,
        sentAmount: amount,
        recipientPubkey,
        remaining: walletActions.getProofsTotal(keep),
      };
    },
    onSuccess: (result) => {
      toast.show(
        `Sent ${result.sentAmount} sats to ${result.recipientPubkey.substring(
          0,
          8,
        )}...`,
      );
    },
  });

  // Listen for incoming token events and claim them
  const listenForIncomingTokens = useCallback(async () => {
    if (!userPubkey) return () => {};

    // Query for existing events directed to the user
    const filter = {
      kinds: [CASHU_TOKEN_EVENT_KIND],
      "#p": [userPubkey],
    };

    const handleEvent = async (event: any) => {
      try {
        // Skip if we've already processed this event
        const processed = await AsyncStorage.getItem(
          `cashu-processed-event:${event.id}`,
        );
        if (processed) return;

        // Get the user's secret key for decryption
        const seckey = await getSeckey();
        if (!seckey) {
          throw new Error("Failed to retrieve secret key");
        }
        const seckeyBytes = hexToBytes(seckey);

        // Decrypt the token
        const encodedToken = await nip44.decrypt(event.content, seckeyBytes);

        // Receive the token
        const receivedProofs = await walletActions.receiveTokens.mutateAsync({
          encodedToken,
        });

        // Save the proofs
        await proofsActions.saveProofs.mutateAsync(receivedProofs);

        // Mark event as processed
        await AsyncStorage.setItem(`cashu-processed-event:${event.id}`, "true");

        // Get amount from tags
        const amountTag = event.tags.find(
          (tag: string[]) => tag[0] === "amount",
        );
        const amount = amountTag
          ? parseInt(amountTag[1])
          : walletActions.getProofsTotal(receivedProofs);

        toast.show(
          `Received ${amount} sats from ${event.pubkey.substring(0, 8)}...`,
        );
      } catch (error) {
        console.error("Error processing incoming token event:", error);
      }
    };

    // Process existing events
    const events = await querySync(filter);
    for (const event of events) {
      await handleEvent(event);
    }

    // Subscribe to new events
    // return subscribeToEvents(filter, handleEvent);
  }, [userPubkey, walletActions, proofsActions]);

  return {
    sendTokensViaNostr,
    listenForIncomingTokens,
    balance: totalBalance,
  };
}
