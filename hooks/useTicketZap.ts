import { useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { useNostrRelayList } from "./nostrRelayList";

import {
  fetchInvoice,
  getZapReceipt,
  openInvoiceInWallet,
  payInvoiceCommand,
  payWithNWC,
} from "@/utils";
import { useRouter } from "expo-router";
import { useSettings } from "./useSettings";
import { useWalletBalance } from "./useWalletBalance";

const fetchInvoiceForTicketZap = async ({
  writeRelayList,
  amountInSats,
  comment,
  contentId,
  timestamp,
  quantity,
}: {
  writeRelayList: string[];
  amountInSats: number;
  comment: string;
  contentId: string;
  timestamp?: number;
  quantity: number;
}) => {
  const ticketEventKind = 31923;
  const ticketBotPublicKey =
    "1c2aa0fb7bf8ed94e0cdb1118bc1b8bd51c6bd3dbfb49b2fd93277b834c40397";
  const nostrEventAddressPointer = `${ticketEventKind}:${ticketBotPublicKey}:${contentId}`;
  return fetchInvoice({
    customTags: [["quantity", quantity.toString()]],
    relayUris: writeRelayList,
    amountInSats: amountInSats,
    comment,
    addressPointer: nostrEventAddressPointer,
    zappedPubkey: ticketBotPublicKey,
    timestamp,
    zapEndpoint: "https://tickets.wavlake.com/v1/zap",
  });
};

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
  const { writeRelayList } = useNostrRelayList();
  const { data: settings } = useSettings();
  const { setBalance } = useWalletBalance();

  const sendZap: SendZap = async ({ comment = "", amount, quantity }) => {
    setIsLoading(true);
    const { enableNWC } = settings || {};
    const amountInSats = Number(amount);
    const response = await fetchInvoiceForTicketZap({
      writeRelayList,
      amountInSats,
      comment,
      contentId: showEventDTag,
      quantity,
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
        const { error, result } = await payWithNWC({
          userPubkey: pubkey,
          invoice,
          walletPubkey: settings?.nwcPubkey,
          nwcRelay: settings?.nwcRelay,
        });

        if (error?.message) {
          toast.show(error.message);
        } else if (result?.preimage) {
          // invoice was paid, we have the preimage
        }
        if (result?.balance) {
          setBalance(result.balance);
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
