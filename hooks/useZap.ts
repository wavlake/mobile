import { useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { useNostrRelayList } from "./nostrRelayList";

import {
  cacheSettings,
  fetchInvoice,
  getZapReceipt,
  openInvoiceInWallet,
  payInvoiceCommand,
  payWithNWC,
} from "@/utils";
import { useRouter } from "expo-router";
import { useSettings } from "./useSettings";

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

type SendZap = (
  props: Partial<{
    comment: string;
    amount: number;
    useNavReplace: boolean;
  }> | void,
) => Promise<void>;

export const useZap = ({
  trackId,
  title,
  artist,
  artworkUrl,
}: {
  trackId?: string;
  title?: string;
  artist?: string;
  artworkUrl?: string;
}): {
  isLoading: boolean;
  sendZap: SendZap;
} => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { pubkey } = useAuth();
  const { writeRelayList } = useNostrRelayList();
  const { data: settings } = useSettings();

  const sendZap: SendZap = async (props) => {
    if (!trackId) {
      return;
    }

    const { comment = "", amount, useNavReplace = false } = props || {};

    setIsLoading(true);
    const {
      defaultZapWallet,
      enableNWC,
      nwcCommands,
      nwcRelay,
      nwcPubkey,
      defaultZapAmount,
    } = settings || {};
    const amountInSats = Number(amount || defaultZapAmount);
    const invoice = await fetchInvoiceForZap({
      writeRelayList,
      amountInSats,
      comment,
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
        const navEvent = {
          pathname: "/zap/success",
          params: {
            title,
            artist,
            artworkUrl,
            zapAmount: amountInSats,
          },
        };
        useNavReplace ? router.replace(navEvent) : router.push(navEvent);
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
          userPubkey: pubkey,
          invoice,
          walletPubkey: settings?.nwcPubkey,
          nwcRelay: settings?.nwcRelay,
        });
        if (response?.error) {
          toast.show(response.error);
          setIsLoading(false);
        } else if (response?.preimage) {
          // invoice was paid
        }
      } else {
        // if no NWC, open invoice in default wallet

        openInvoiceInWallet(settings?.defaultZapWallet ?? "default", invoice);
        setIsLoading(false);
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
