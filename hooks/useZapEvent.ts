import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";
import {
  fetchInvoice,
  getZapReceipt,
  openInvoiceInWallet,
  payInvoiceCommand,
  payWithNWC,
  signEvent,
} from "@/utils";
import { useSettings } from "./useSettings";
import { useWalletBalance } from "./useWalletBalance";
import { Event, nip57 } from "nostr-tools";
import { useUser } from "./useUser";
import { fetchLNURLPaymentInfo, validateLNURLPayAmount } from "@/utils/luds";
import { DEFAULT_WRITE_RELAY_URIS } from "@/utils/shared";
import { useNostrProfile } from "./nostrProfile";

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
  const { enableNWC } = settings || {};
  const { data, setBalance, refetch: refetchBalance } = useWalletBalance();
  const { max_payment: maxNWCPayment } = data || {};
  const { pubkey, userIsLoggedIn } = useAuth();
  const { catalogUser } = useUser();
  const { getProfileMetadata, decodeProfileMetadata } = useNostrProfile();

  // clear success state after 5 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const userIdOrPubkey = catalogUser?.id ?? pubkey;

  const toast = useToast();

  const shouldPayWithNWC = Boolean(
    userIsLoggedIn &&
      pubkey &&
      enableNWC &&
      settings?.nwcCommands.includes(payInvoiceCommand),
  );

  const sendZap: SendZap = async ({ event, comment = "", amountInSats }) => {
    if (shouldPayWithNWC && maxNWCPayment && amountInSats > maxNWCPayment) {
      toast.show(
        `Amount must be less than your NWC maximum of ${maxNWCPayment} sats`,
      );
      return;
    }

    const userProfileEvent = await getProfileMetadata(event.pubkey);
    const userProfile = decodeProfileMetadata(userProfileEvent);
    if (!userProfile?.lud16) {
      toast.show("Unable to find author's LNURL.");
      return;
    }

    try {
      // Get LNURL-pay metadata and callback URL
      const { callback, maxSendable, minSendable, metadata } =
        await fetchLNURLPaymentInfo(userProfile.lud16);

      // Convert sats to msats for LNURL
      const amountMsats = amountInSats * 1000;

      // Validate amount against LNURL constraints
      if (!validateLNURLPayAmount(amountMsats, minSendable, maxSendable)) {
        toast.show(
          `Amount must be between ${minSendable / 1000} and ${
            maxSendable / 1000
          } sats`,
        );
        return;
      }

      // Rest of the existing zap flow using callback as zapEndpoint
      setIsLoading(true);
      // TODO - determine which relays to use for the pubkey being zapped
      const relays = DEFAULT_WRITE_RELAY_URIS;
      const zapRequest = await nip57.makeZapRequest({
        profile: event.pubkey,
        event: event.id,
        amount: amountMsats,
        relays: [...relays],
        comment,
      });
      const signedZapRequest = await signEvent(zapRequest);
      if (!signedZapRequest) {
        toast.show("Failed to sign zap request.");
        setIsLoading(false);
        return;
      }

      const response = await fetchInvoice({
        zapRequest: signedZapRequest,
        amountInSats,
        zapEndpoint: callback,
      });

      if ("reason" in response) {
        toast.show(response.reason);
        setIsLoading(false);

        return;
      }

      const invoice = response.pr;
      // start listening for payment ASAP
      try {
        getZapReceipt(invoice).then((zapReceipt) => {
          if (zapReceipt) {
            setIsLoading(false);
            setIsSuccess(true);
          }
        });
      } catch {
        // Fail silently if unable to connect to relay to get zap receipt.
      }

      // pay the invoice
      try {
        if (shouldPayWithNWC && settings) {
          // use NWC, responds with preimage if successful
          const response = await payWithNWC({
            userIdOrPubkey,
            invoice,
            walletPubkey: settings.nwcPubkey,
            nwcRelay: settings.nwcRelay,
          });

          const { error, result, result_type } = response;
          if (result_type !== "pay_invoice") {
            setIsLoading(false);
            toast.show(
              `Something went wrong, result_type: ${result_type}. Please try again later.`,
            );
            return;
          }
          if (error?.message) {
            const errorMsg = `${error.code ?? "Error"}: ${error.message}`;
            setIsLoading(false);
            toast.show(
              `Something went wrong: ${errorMsg}. Please try again later.`,
            );
            return;
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
        console.error("useZapEvent error", e);
        toast.show(
          "Something went wrong while paying the invoice. Please try again later.",
        );
      }
    } catch (e) {
      console.error("useZapEvent error", e);
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
