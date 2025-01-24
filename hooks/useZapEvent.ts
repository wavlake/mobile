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
  makeZapRequest,
  signEvent,
} from "@/utils";
import { useRouter } from "expo-router";
import { useSettings } from "./useSettings";
import { useWalletBalance } from "./useWalletBalance";
import { usePublishComment } from "./usePublishComment";
import { Event, EventTemplate, nip19 } from "nostr-tools";
import { useUser } from "./useUser";

type SendZap = (
  props: Partial<{
    event: Event;
    comment: string;
    amount: number;
    useNavReplace: boolean;
  }> | void,
) => Promise<void>;

export const useZapEvent = ({}: {}): {
  isLoading: boolean;
  sendZap: SendZap;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  // const { save: publishComment, isSaving: isPublishingComment } =
  //   usePublishComment();
  // const router = useRouter();
  // const { pubkey, userIsLoggedIn } = useAuth();
  // const { writeRelayList } = useNostrRelayList();
  // const { data: settings } = useSettings();
  // const { data, setBalance, refetch: refetchBalance } = useWalletBalance();
  // const { max_payment: maxNWCPayment } = data || {};
  // const { enableNWC, defaultZapAmount } = settings || {};

  const sendZap: SendZap = async (props) => {
    toast.show("Event zapping not yet implemented");
  };

  return {
    isLoading,
    sendZap,
  };
};
