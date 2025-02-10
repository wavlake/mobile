import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import { useNostrRelayList } from "./nostrRelayList";

import {
  fetchInvoice,
  getZapReceipt,
  openInvoiceInWallet,
  payInvoiceCommand,
  payWithNWC,
  makeZapRequest,
  signEvent,
} from "@/utils";
import { useRouter } from "expo-router";
import { useSettings } from "./useSettings";
import { useWalletBalance } from "./useWalletBalance";
import { usePublishComment } from "./usePublishComment";
import { Event, EventTemplate, nip19, nip57 } from "nostr-tools";
import { useUser } from "./useUser";

type SendZap = (props: {
  event: Event;
  comment?: string;
  amountInSats: number;
}) => Promise<void>;

export const useZapEvent = (): {
  isLoading: boolean;
  isSuccess: boolean;
  sendZap: SendZap;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: settings } = useSettings();
  const { enableNWC, defaultZapAmount } = settings || {};
  const { data, setBalance, refetch: refetchBalance } = useWalletBalance();
  const { max_payment: maxNWCPayment } = data || {};
  const { pubkey, userIsLoggedIn } = useAuth();
  const { catalogUser } = useUser();

  // clear success state after 5 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const userIdOrPubkey = catalogUser?.id ?? pubkey;

  const toast = useToast();

  const sendZap: SendZap = async ({ event, comment = "", amountInSats }) => {
    // TODO - check if maxNWCPayment is in sats or msats
    if (enableNWC && maxNWCPayment && amountInSats > maxNWCPayment) {
      toast.show(
        `Your wallet's zap limit is ${maxNWCPayment} sats. Please try a lower amount or adjust your wallet limits.`,
      );
      return;
    }
    setIsLoading(true);

    const zapRequest = await nip57.makeZapRequest({
      profile: event.pubkey,
      amount: amountInSats * 1000,
      // TODO - figure out which relays to use, based on zapee's pubkey?
      relays: [],
      comment,
      event: null,
    });
    const signedZapRequest = await signEvent(zapRequest);
    if (!signedZapRequest) {
      toast.show("Failed to sign zap request.");
      setIsLoading(false);
      return;
    }

    const response = await fetchInvoice({
      zapRequest,
      amountInSats,
      // TODO figure out which zapEndpoint to use, based of pubkey's lnurl?
      zapEndpoint: "",
    });

    if ("reason" in response) {
      toast.show(response.reason);
      setIsLoading(false);

      return;
    }

    const invoice = response.pr;
    // start listening for payment ASAP
    try {
      const zapReceipt = await getZapReceipt(invoice);

      if (zapReceipt) {
        setIsLoading(false);
        setIsSuccess(true);
      }
    } catch {
      // Fail silently if unable to connect to relay to get zap receipt.
    }

    // pay the invoice
    // pay the invoice
    try {
      if (
        userIsLoggedIn &&
        pubkey &&
        enableNWC &&
        settings?.nwcCommands.includes(payInvoiceCommand)
      ) {
        // use NWC, responds with preimage if successful
        const response = await payWithNWC({
          userIdOrPubkey,
          invoice,
          walletPubkey: settings.nwcPubkey,
          nwcRelay: settings.nwcRelay,
        });

        const { error, result, result_type } = response;

        if (result_type !== "pay_invoice") {
          toast.show("Something went wrong. Please try again later.");
          return;
        }
        if (error?.message) {
          const errorMsg = `${error.code ?? "Error"}: ${error.message}`;
          toast.show(errorMsg);
        }
        if (result?.balance) {
          setBalance(result.balance);
        } else {
          refetchBalance();
        }
      } else {
        // fallback to opening the invoice in the default wallet
        openInvoiceInWallet(settings?.defaultZapWallet ?? "default", invoice);
      }
    } catch (e) {
      console.log("useZapContent error", e);
      toast.show("Something went wrong. Please try again later.");
    }

    // all done
    setIsLoading(false);
    return;
  };

  return {
    isLoading,
    isSuccess,
    sendZap,
  };
};
