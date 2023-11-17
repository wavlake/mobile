import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { useNostrRelayList } from "./nostrRelayList";

import {
  fetchInvoice,
  getSettings,
  getZapReceipt,
  openInvoiceInWallet,
  payInvoiceCommand,
  payWithNWC,
} from "@/utils";

const fetchInvoiceForZap = async ({
  writeRelayList,
  amountInSats,
  comment,
  contentId,
}: {
  writeRelayList: string[];
  amountInSats: number;
  comment: string;
  contentId: string;
}) => {
  const wavlakeTrackKind = 32123;
  const wavlakePubkey =
    "7759fb24cec56fc57550754ca8f6d2c60183da2537c8f38108fdf283b20a0e58";
  const nostrEventAddressPointer = `${wavlakeTrackKind}:${wavlakePubkey}:${contentId}`;
  return fetchInvoice({
    relayUris: writeRelayList,
    amountInSats: amountInSats,
    comment,
    addressPointer: nostrEventAddressPointer,
    zappedPubkey: wavlakePubkey,
  });
};

export const useZap = ({
  trackId,
}: {
  trackId: string;
}): {
  isLoading: boolean;
  sendZap: () => Promise<void>;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { pubkey } = useAuth();
  const { writeRelayList } = useNostrRelayList();

  const sendZap = async () => {
    setIsLoading(true);
    const {
      defaultZapWallet,
      enableNWC,
      nwcCommands,
      nwcRelay,
      nwcPubkey,
      defaultZapAmount,
    } = await getSettings(pubkey);

    const invoice = await fetchInvoiceForZap({
      writeRelayList,
      amountInSats: Number(defaultZapAmount),
      comment: "",
      contentId: trackId,
    });

    if (!invoice) {
      toast.show("Failed to fetch invoice. Please try again later.");
      setIsLoading(false);

      return;
    }
    // start listening for payment ASAP
    try {
      getZapReceipt(invoice).then(() => {
        console.log("zap receipt received");
      });
    } catch {
      // Fail silently if unable to connect to wavlake relay to get zap receipt.
    }

    try {
      if (pubkey && enableNWC && nwcCommands.includes(payInvoiceCommand)) {
        // use NWC, responds with preimage if successful
        const response = await payWithNWC({
          userPubkey: pubkey,
          invoice,
          walletPubkey: nwcPubkey,
          nwcRelay,
        });
        if (response?.error) {
          toast.show(response.error);
          setIsLoading(false);
        } else if (response?.preimage) {
          // invoice was paid
        }
      } else {
        // if no NWC, open invoice in default wallet
        await openInvoiceInWallet(defaultZapWallet, invoice);
      }
    } catch {
      toast.show("Something went wrong. Please try again later.");
      setIsLoading(false);

      return;
    }
  };

  return {
    isLoading,
    sendZap,
  };
};
