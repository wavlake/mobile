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
import { getPodcastFeedGuid } from "@/utils/rss";
import { usePublishComment } from "./usePublishComment";
import { Event, nip19 } from "nostr-tools";

const wavlakeTrackKind = 32123;
const wavlakePubkey =
  "7759fb24cec56fc57550754ca8f6d2c60183da2537c8f38108fdf283b20a0e58";
const fetchInvoiceForZap = async ({
  writeRelayList,
  amountInSats,
  comment,
  contentId,
  timestamp,
  parentContentType,
}: {
  writeRelayList: string[];
  amountInSats: number;
  comment: string;
  contentId: string;
  parentContentType: "podcast" | "album" | "artist";
  timestamp?: number;
}) => {
  const nostrEventAddressPointer = `${wavlakeTrackKind}:${wavlakePubkey}:${contentId}`;
  const iTags = [
    ["i", `podcast:item:guid:${contentId}`],
    ["i", `podcast:guid:${getPodcastFeedGuid(parentContentType, contentId)}`],
    [
      "i",
      `podcast:publisher:guid:${getPodcastFeedGuid(
        parentContentType,
        contentId,
      )}`,
    ],
  ];

  return fetchInvoice({
    relayUris: writeRelayList,
    amountInSats: amountInSats,
    comment,
    addressPointer: nostrEventAddressPointer,
    zappedPubkey: wavlakePubkey,
    timestamp,
    customTags: iTags,
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
  const { save: publishComment, isSaving: isPublishingComment } =
    usePublishComment();
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
      parentContentType: isPodcast ? "podcast" : "album",
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
          // TODO - investigate why this is failing
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
        // if no NWC, open invoice in default wallet
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
const t = {
  id: "86c000547b2b864106f6c88c41983c27be62e5175436110b705813a4330070f7",
  pubkey: "bd1e19980e2c91e6dc657e92c25762ca882eb9272d2579e221f037f93788de91",
  created_at: 1721249167,
  kind: 1,
  tags: [
    ["p", "140b0eceefcaa723f11c781b0a341e6c6d9d5e87e5406376d1da196c75abe39e"],
    ["p", "140b0eceefcaa723f11c781b0a341e6c6d9d5e87e5406376d1da196c75abe39e"],
  ],
  content:
    "🤣 nostr:note1lrmtx2wdfrvuek494vqv6kzg9mrduufu356e08c09udg8q0p360qe0uw8y",
  sig: "f9da65e170939d45357b026c993f7fc59c2268b8800f72ffbece23c5cbd68afc575c6c3143a1761ec439a1f5bfbbb386be3246d17992f8da4ba181351092aaf0",
};
