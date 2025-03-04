import { useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { useNostrRelayList } from "./nostrRelayList";

import {
  fetchInvoice,
  getZapReceipt,
  makeTicketZapRequest,
  openInvoiceInWallet,
  payInvoiceCommand,
  payWithNWC,
  signEvent,
} from "@/utils";
import { useSettings } from "./useSettings";
import { useWalletBalance } from "./useWalletBalance";
import { useUser } from "./useUser";

type SendZap = (props: {
  comment: string;
  amount: number;
  quantity: number;
}) => Promise<void>;

export const useTicketZap = (showEventDTag: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const toast = useToast();
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const userIdOrPubkey = catalogUser?.id ?? pubkey;
  const { writeRelayList } = useNostrRelayList();
  const { data: settings } = useSettings();
  const { setBalance, refetch: refetchBalance } = useWalletBalance();

  const sendZap: SendZap = async ({ comment = "", amount, quantity }) => {
    setIsLoading(true);
    const { enableNWC } = settings || {};
    const amountInSats = Number(amount);
    const zapRequest = await makeTicketZapRequest({
      contentId: showEventDTag,
      amountInSats,
      comment,
      relays: writeRelayList,
      customTags: [["quantity", quantity.toString()]],
    });

    const signedZapRequestEvent = await signEvent(zapRequest);

    if (!signedZapRequestEvent) {
      toast.show("Failed to sign zap request.");
      setIsLoading(false);
      return;
    }

    const response = await fetchInvoice({
      amountInSats: amountInSats,
      zapRequest: signedZapRequestEvent,
    });

    if ("reason" in response) {
      toast.show(response.reason);
      setIsLoading(false);

      return;
    }
    const invoice = response.pr;
    // start listening for payment ASAP
    try {
      getZapReceipt(invoice).then(() => {
        setIsLoading(false);
        setIsPaid(true);
        toast.show("Ticket purchase successful!");
      });
    } catch {
      // Fail silently if unable to connect to wavlake relay to get zap receipt.
    }
    try {
      if (
        pubkey &&
        enableNWC &&
        settings?.nwcCommands.includes(payInvoiceCommand)
      ) {
        // use NWC, responds with preimage if successful
        const response = await payWithNWC({
          userIdOrPubkey,
          invoice,
          walletPubkey: settings?.nwcPubkey,
          nwcRelay: settings?.nwcRelay,
        });
        const { error, result, result_type } = response;
        if (result_type !== "pay_invoice") {
          toast.show("Something went wrong. Please try again later.");
          return;
        }
        if (error?.message) {
          toast.show(error.message);
        } else if (result?.preimage) {
          // invoice was paid, we have the preimage
        }
        if (result?.balance) {
          setBalance(result.balance);
        } else {
          refetchBalance();
        }
      } else {
        // if no NWC, open invoice in default wallet
        openInvoiceInWallet(settings?.defaultZapWallet ?? "default", invoice);
      }
    } catch {
      toast.show("Something went wrong. Please try again later.");
    }

    // all done
    setIsLoading(false);
    return;
  };

  return {
    isLoading,
    isPaid,
    sendZap,
  };
};
