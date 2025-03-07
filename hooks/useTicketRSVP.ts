import { useState, useCallback } from "react";
import { UnsignedEvent, Event } from "nostr-tools";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./useAuth";
import { publishEvent, signEvent } from "@/utils";
import { useNostrRelayList } from "./nostrRelayList";
import { useZapEvent } from "./useZapEvent";

type RSVPStatus = "accepted" | "declined" | "tentative";
type FreeOrBusy = "free" | "busy";

interface RSVPParams {
  status: RSVPStatus;
  freeOrBusy?: FreeOrBusy;
  comment?: string;
  calendarEvent: Event;
  ticketCount?: number;
  paymentComment?: string;
  publishRSVP?: boolean;
}

interface RSVPResult {
  rsvpEventId?: string;
  success?: boolean;
  error?: string;
}

export const useTicketRSVP = () => {
  const { pubkey } = useAuth();
  const { writeRelayList } = useNostrRelayList();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<RSVPResult | null>(null);
  const {
    sendZap,
    isLoading: isZapLoading,
    isSuccess: isZapSuccess,
    zapConfirmationData,
  } = useZapEvent();

  const [confirmationPromiseResolve, setConfirmationPromiseResolve] = useState<
    ((value: boolean) => void) | null
  >(null);

  const handleConfirmation = useCallback(
    (confirmed: boolean) => {
      if (confirmationPromiseResolve) {
        confirmationPromiseResolve(confirmed);
        setConfirmationPromiseResolve(null);
      }
    },
    [confirmationPromiseResolve],
  );

  const confirmationCallback = useCallback(async () => {
    return new Promise<boolean>((resolve) => {
      setConfirmationPromiseResolve(() => resolve);
    });
  }, []);

  const submitRSVP = useCallback(
    async ({
      status,
      freeOrBusy,
      comment = "",
      calendarEvent,
      ticketCount = 1,
      paymentComment = "Ticket payment for event id: " + calendarEvent.id,
      publishRSVP = false,
    }: RSVPParams): Promise<RSVPResult> => {
      const calendarEventCoordinates =
        formatCalendarEventCoordinates(calendarEvent);

      if (!status) {
        const result = { success: false, error: "RSVP status is required" };
        setLastResult(result);
        return result;
      }

      // If status is 'declined', we should not include the 'fb' tag
      if (status === "declined" && freeOrBusy) {
        freeOrBusy = undefined;
      }

      setIsSubmitting(true);
      const result: RSVPResult = { success: false };

      try {
        if (status === "accepted") {
          try {
            const paymentResult = await sendZap({
              event: calendarEvent,
              comment: paymentComment,
              // the backend will determine the sats amount
              // some events may have a fiat price that needs to be converted when generating the invoice
              amountInSats: 1,
              customRequestTags: [["count", ticketCount.toString()]],
              showConfirmation: true,
              onConfirm: confirmationCallback,
            });

            if (!paymentResult.success) {
              result.error = paymentResult.error || "Failed to send payment";
            }
            result.success = paymentResult.success;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown payment error";
            result.error = errorMessage;
          }
        }

        if (publishRSVP) {
          // Create the RSVP event
          const tags = [
            ["a", calendarEventCoordinates],
            ["d", uuidv4()],
            ["status", status],
            ["e", calendarEvent.id],
            ["p", calendarEvent.pubkey],
          ];

          if (freeOrBusy) {
            tags.push(["fb", freeOrBusy]);
          }

          // Create the unsigned event
          const unsignedEvent: UnsignedEvent = {
            kind: 31925,
            created_at: Math.floor(Date.now() / 1000),
            tags,
            content: comment,
            pubkey,
          };

          const signedEvent = await signEvent(unsignedEvent);

          if (!signedEvent) {
            result.error = "Failed to sign event";
            setLastResult(result);
            return result;
          }

          // Publish to relays
          await publishEvent(writeRelayList, signedEvent);

          result.rsvpEventId = signedEvent.id;
        }

        setLastResult(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        result.error = errorMessage;
        setLastResult(result);
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [writeRelayList, pubkey, sendZap, confirmationCallback],
  );

  // Helper function to format calendar event coordinates from its components
  const formatCalendarEventCoordinates = useCallback((event: Event): string => {
    if (event.kind !== 31922 && event.kind !== 31923) {
      throw new Error("Invalid calendar event kind: " + event.kind);
    }

    const dIdentifier = event.tags.find((tag) => tag[0] === "d")?.[1] || "";
    return `${event.kind}:${event.pubkey}:${dIdentifier}`;
  }, []);

  return {
    submitRSVP,
    formatCalendarEventCoordinates,
    isSubmitting,
    isZapLoading,
    isZapSuccess,
    lastResult,
    zapConfirmationData,
    handleConfirmation,
  };
};
