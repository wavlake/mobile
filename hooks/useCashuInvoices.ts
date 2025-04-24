import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { useCashuMint } from "./useCashuMint";
import { useCashuProofs } from "./useCashuProofs";

export function useLightningWithCashu(mintUrl?: string) {
  const toast = useToast();
  const { wallet, actions: walletActions } = useCashuMint({ mintUrl });
  const {
    proofs,
    totalBalance,
    actions: proofsActions,
  } = useCashuProofs(mintUrl);

  // Create a Lightning invoice to receive funds into Cashu
  const createInvoice = useMutation({
    mutationFn: async ({
      amount,
      description,
    }: {
      amount: number;
      description?: string;
    }) => {
      // Create mint quote
      const mintQuote = await walletActions.createMintQuote.mutateAsync({
        amount,
        description,
      });
      console.log("Mint quote:", mintQuote);
      return {
        invoice: mintQuote.request,
        quoteId: mintQuote.quote,
        // amount: mintQuote.amount,
        amount: 123,
      };
    },
  });

  // Check if invoice is paid and mint tokens
  const claimPaidInvoice = useMutation({
    mutationFn: async ({
      quoteId,
      amount,
    }: {
      quoteId: string;
      amount: number;
    }) => {
      // Check if quote is paid
      const quoteStatus =
        await walletActions.checkMintQuote.mutateAsync(quoteId);

      if (quoteStatus.state !== "PAID") {
        throw new Error("Invoice not paid yet");
      }

      // Mint proofs
      const newProofs = await walletActions.mintProofs.mutateAsync({
        amount,
        quoteId,
      });

      // Save the proofs
      await proofsActions.saveProofs.mutateAsync(newProofs);

      return newProofs;
    },
    onSuccess: (newProofs) => {
      const amount = walletActions.getProofsTotal(newProofs);
      toast.show(`Received ${amount} sats via Lightning`);
    },
  });

  // Pay a Lightning invoice using Cashu tokens
  const payInvoice = useMutation({
    mutationFn: async ({ invoice }: { invoice: string }) => {
      if (!proofs || proofs.length === 0) {
        throw new Error("No tokens available to pay with");
      }

      // Create melt quote
      const meltQuote =
        await walletActions.createMeltQuote.mutateAsync(invoice);

      // Calculate the total amount needed (invoice amount + fee)
      const totalNeeded = meltQuote.amount + meltQuote.fee_reserve;

      if (totalBalance < totalNeeded) {
        throw new Error(
          `Insufficient funds. Need ${totalNeeded} sats but only have ${totalBalance} sats`,
        );
      }

      // Prepare proofs for payment
      const { send, keep } = await walletActions.sendTokens.mutateAsync({
        amount: totalNeeded,
        proofs,
        options: { includeFees: true },
      });

      // Pay the invoice
      const result = await walletActions.meltProofs.mutateAsync({
        meltQuote,
        proofs: send,
      });

      // Update stored proofs (remove spent ones, add change)
      const updatedProofs = [...keep, ...(result.change || [])];

      await proofsActions.updateProofs.mutateAsync(updatedProofs);

      return {
        success: true,
        paymentAmount: meltQuote.amount,
        fee: meltQuote.fee_reserve,
        preimage: "testing", //result.preimage,
      };
    },
    onSuccess: (result) => {
      toast.show(`Paid ${result.paymentAmount} sats (fee: ${result.fee} sats)`);
    },
  });

  // Set up a listener for mint quote updates
  const setupMintQuoteListener = useCallback(
    async (quoteId: string, onPaid: () => void) => {
      if (!wallet) return () => {};

      try {
        const unsub = await wallet.onMintQuoteUpdates(
          [quoteId],
          (update) => {
            if (update.state === "PAID") {
              onPaid();
            }
          },
          (error) => {
            console.error("Mint quote update error:", error);
          },
        );

        return unsub;
      } catch (error) {
        console.error("Failed to set up mint quote listener:", error);
        return () => {};
      }
    },
    [wallet],
  );

  return {
    createInvoice,
    claimPaidInvoice,
    payInvoice,
    setupMintQuoteListener,
    balance: totalBalance,
  };
}
