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
import { useWavlakeWalletZap } from "@/utils/authTokenApi";

const fetchInvoiceForZap = async ({
  writeRelayList,
  amountInSats,
  comment,
  contentId,
  timestamp,
}: {
  writeRelayList: string[];
  amountInSats: number;
  comment: string;
  contentId: string;
  timestamp?: number;
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
    timestamp,
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
  timestamp,
}: {
  trackId?: string;
  title?: string;
  artist?: string;
  artworkUrl?: string;
  timestamp?: number;
}): {
  isLoading: boolean;
  sendZap: SendZap;
} => {
  const { mutateAsync: wavlakeWalletZap } = useWavlakeWalletZap({});
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { pubkey } = useAuth();
  const { writeRelayList } = useNostrRelayList();
  const { data: settings } = useSettings();
  const { setBalance } = useWalletBalance();

  const sendZap: SendZap = async (props) => {
    if (!trackId) {
      return;
    }

    const { comment = "", amount, useNavReplace = false } = props || {};

    setIsLoading(true);
    const {
      defaultZapWallet,
      enableWavlakeWallet,
      enableNWC,
      nwcCommands,
      nwcRelay,
      nwcPubkey,
      defaultZapAmount,
    } = settings || {};
    const amountInSats = Number(amount || defaultZapAmount);
    const response = await fetchInvoiceForZap({
      writeRelayList,
      amountInSats,
      comment,
      contentId: trackId,
      timestamp,
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
        const navEvent = {
          pathname: "/zap/success",
          params: {
            title,
            artist,
            artworkUrl,
            zapAmount: amountInSats,
          },
        };
        setIsLoading(false);
        useNavReplace ? router.replace(navEvent) : router.push(navEvent);
      });
    } catch {
      // Fail silently if unable to connect to wavlake relay to get zap receipt.
    }

    try {
      if (pubkey && enableWavlakeWallet) {
        await wavlakeWalletZap({
          contentId: trackId,
          msatAmount: amountInSats * 1000,
          comment,
          contentTime: timestamp,
        });
      } else if (
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
    sendZap,
  };
};
