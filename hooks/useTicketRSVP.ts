import { useState, useCallback } from "react";
import { Event, UnsignedEvent } from "nostr-tools";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "./useAuth";
import { publishEvent, signEvent } from "@/utils";
import { useNostrRelayList } from "./nostrRelayList";
import { WAVLAKE_RELAY } from "@/utils/shared";

type RSVPStatus = "accepted" | "declined" | "tentative";
type FreeOrBusy = "free" | "busy";

interface RSVPParams {
  calendarEventId?: string; // Optional event ID (e tag)
  calendarEventCoordinates: string; // Required event coordinates (a tag) in format "kind:pubkey:d-identifier"
  calendarEventAuthorPubkey?: string; // Optional author pubkey (p tag)
  status: RSVPStatus; // Required status
  freeOrBusy?: FreeOrBusy; // Optional free/busy indicator
  note?: string; // Optional note for the content field
}

interface RSVPResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

export const useTicketRSVP = () => {
  const { pubkey } = useAuth();
  const { writeRelayList } = useNostrRelayList();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<RSVPResult | null>(null);

  const submitRSVP = useCallback(
    async ({
      calendarEventId,
      calendarEventCoordinates,
      calendarEventAuthorPubkey,
      status,
      freeOrBusy,
      note = "",
    }: RSVPParams): Promise<RSVPResult> => {
      if (!calendarEventCoordinates) {
        const result = {
          success: false,
          error: "Calendar event coordinates are required",
        };
        setLastResult(result);
        return result;
      }

      if (!status) {
        const result = { success: false, error: "RSVP status is required" };
        setLastResult(result);
        return result;
      }

      // If status is 'declined', we should not include the 'fb' tag
      if (status === "declined" && freeOrBusy) {
        freeOrBusy = undefined;
      }

      setIsLoading(true);

      try {
        // Create the RSVP event
        const tags = [
          ["a", calendarEventCoordinates],
          ["d", uuidv4()],
          ["status", status],
        ];

        // Add optional tags if provided
        if (calendarEventId) {
          tags.push(["e", calendarEventId]);
        }

        if (freeOrBusy) {
          tags.push(["fb", freeOrBusy]);
        }

        if (calendarEventAuthorPubkey) {
          tags.push(["p", calendarEventAuthorPubkey, WAVLAKE_RELAY]);
        }

        // Create the unsigned event
        const unsignedEvent: UnsignedEvent = {
          kind: 31925,
          created_at: Math.floor(Date.now() / 1000),
          tags,
          content: note,
          pubkey,
        };

        const signedEvent = await signEvent(unsignedEvent);

        if (!signedEvent) {
          const result = { success: false, error: "Failed to sign event" };
          setLastResult(result);
          return result;
        }

        // Publish to relays
        await publishEvent(writeRelayList, signedEvent);

        const result = { success: true, eventId: signedEvent.id };

        setLastResult(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const result = { success: false, error: errorMessage };
        setLastResult(result);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [writeRelayList, pubkey],
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
    isLoading,
    lastResult,
  };
};
