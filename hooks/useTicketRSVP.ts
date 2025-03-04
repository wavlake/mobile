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
  status: RSVPStatus; // Required status
  freeOrBusy?: FreeOrBusy; // Optional free/busy indicator
  comment?: string; // Optional comment for the content field
  calendarEvent: Event; // The original calendar event for zapping
  ticketCount?: number; // Number of tickets to RSVP for
  paymentAmountInSats?: number; // Amount to zap if payment is required
  paymentComment?: string; // Comment for the payment zap
}

interface RSVPResult {
  success: boolean;
  eventId?: string;
  error?: string;
  paymentSuccess?: boolean;
  paymentError?: string;
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
  } = useZapEvent();

  const submitRSVP = useCallback(
    async ({
      status,
      freeOrBusy,
      comment = "",
      calendarEvent,
      ticketCount = 1,
      paymentAmountInSats,
      paymentComment = "Ticket payment for event id: " + calendarEvent.id,
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
        // If payment is required and status is 'accepted', process the zap first
        let paymentSuccess = false;
        if (
          status === "accepted" &&
          paymentAmountInSats &&
          paymentAmountInSats > 0
        ) {
          try {
            await sendZap({
              event: calendarEvent,
              comment: paymentComment,
              amountInSats: paymentAmountInSats,
              customRequestTags: [["count", ticketCount.toString()]],
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown payment error";
            result.paymentSuccess = false;
            result.paymentError = errorMessage;
          }
        }

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

        // Add payment information to the RSVP if applicable
        if (paymentAmountInSats && paymentAmountInSats > 0) {
          tags.push(["payment", paymentAmountInSats.toString()]);
          tags.push([
            "payment_status",
            result.paymentSuccess ? "completed" : "pending",
          ]);
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

        result.success = true;
        result.eventId = signedEvent.id;

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
    [writeRelayList, pubkey, sendZap, isZapLoading, isZapSuccess],
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
  };
};
