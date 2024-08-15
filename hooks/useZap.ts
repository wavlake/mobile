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
  useWavlakeWalletZap,
  makeZapRequest,
  signEvent,
} from "@/utils";
import { useRouter } from "expo-router";
import { useSettings } from "./useSettings";
import { useWalletBalance } from "./useWalletBalance";
import { usePublishComment } from "./usePublishComment";
import { Event, nip19 } from "nostr-tools";
import { useUser } from "@/components";

type SendZap = (
  props: Partial<{
    comment: string;
    amount: number;
    useNavReplace: boolean;
  }> | void,
) => Promise<void>;

export const useZap = ({
  isPodcast,
  trackId,
  title,
  artist,
  artworkUrl,
  timestamp,
}: {
  isPodcast: boolean;
  trackId?: string;
  title?: string;
  artist?: string;
  artworkUrl?: string;
  timestamp?: number;
}): {
  isLoading: boolean;
  sendZap: SendZap;
} => {
  const toast = useToast();
  const { mutateAsync: wavlakeWalletZap } = useWavlakeWalletZap({
    onError: (error) => {
      toast.show(error);
    },
  });
  const { save: publishComment, isSaving: isPublishingComment } =
    usePublishComment();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { pubkey, userIsLoggedIn } = useAuth();
  const { catalogUser } = useUser();
  const { writeRelayList } = useNostrRelayList();
  const { data: settings } = useSettings();
  const { setBalance } = useWalletBalance();

  const sendZap: SendZap = async (props) => {
    if (!trackId) {
      return;
    }
    const { comment = "", amount, useNavReplace = false } = props || {};
    const zapRequest = await makeZapRequest({
      amountInSats: amount ?? 0,
      relays: writeRelayList,
      comment,
      contentId: trackId,
      timestamp,
      parentContentType: isPodcast ? "podcast" : "album",
    });
    const signedZapRequestEvent = await signEvent(zapRequest);

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
    const response = await fetchInvoice({
      amountInSats,
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
      getZapReceipt(invoice).then((zapReceipt) => {
        const [descTag, zapRequest] =
          zapReceipt?.tags.find(([tag]) => tag === "description") || [];

        if (
          comment.length > 0 &&
          settings?.publishKind1 &&
          zapReceipt &&
          zapRequest
        ) {
          const parsedZapRequest: Event = JSON.parse(zapRequest);
          const { id } = parsedZapRequest;
          const iTags = parsedZapRequest.tags.filter((tag) => tag[0] === "i");
          const shareUrl = isPodcast
            ? `https://wavlake.com/episode/${trackId}`
            : `https://wavlake.com/track/${trackId}`;
          const eventUrl = `nostr:${nip19.neventEncode(zapReceipt)}`;
          const commentWithLinks =
            comment + "\n\n" + shareUrl + "\n\n" + eventUrl;

          publishComment(commentWithLinks, id, iTags);
        }
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
      if (
        enableWavlakeWallet &&
        userIsLoggedIn &&
        catalogUser?.isRegionVerified
      ) {
        await wavlakeWalletZap({
          zapPayload: {
            contentId: trackId,
            msatAmount: amountInSats * 1000,
            comment,
            contentTime: timestamp,
          },
          zapRequest: signedZapRequestEvent,
        });
      } else if (
        userIsLoggedIn &&
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
        }).catch((e) => {
          console.log("useZap payWithNWC error", e);
          return { error: undefined, result: undefined };
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
        // fallback to opening the invoice in the default wallet
        openInvoiceInWallet(settings?.defaultZapWallet ?? "default", invoice);
      }
    } catch (e) {
      console.log("useZap error", e);
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
