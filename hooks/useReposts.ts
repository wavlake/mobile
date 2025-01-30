import { useMutation } from "@tanstack/react-query";
import { Event, nip19 } from "nostr-tools";
import { useNostrRelayList } from "./nostrRelayList";
import { useAuth } from "./useAuth";
import { signEvent, publishEvent } from "@/utils";
import { useEventRelatedEvents } from "./useEventRelatedEvents";

interface UseRepostsResult {
  repostEvent: (event: Event, quote?: string) => Promise<void>;
}

const makeRepostEvent = ({
  pubkey,
  event,
  relayUrl,
}: {
  pubkey: string;
  event: Event;
  relayUrl: string;
}) => {
  return {
    kind: 6,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["e", event.id, relayUrl],
      ["p", event.pubkey],
    ],
    content: JSON.stringify(event),
  };
};

const makeQuoteRepostEvent = ({
  pubkey,
  content,
  event,
  relayUrl,
}: {
  pubkey: string;
  content: string;
  event: Event;
  relayUrl: string;
}) => {
  const nevent = nip19.neventEncode({
    id: event.id,
    author: event.pubkey,
    relays: [relayUrl],
  });

  return {
    kind: 1,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["q", event.id, relayUrl, event.pubkey],
      ["p", event.pubkey],
    ],
    content: `${content}\n\nnostr:${nevent}`,
  };
};

export const useRepostsQueryKey = (eventId?: string) => ["reposts", eventId];
export const useQuoteRepostsQueryKey = (eventId?: string) => [
  "quoteReposts",
  eventId,
];

export const useReposts = (event: Event): UseRepostsResult => {
  const { addEventToCache } = useEventRelatedEvents(event);
  const { pubkey, userIsLoggedIn } = useAuth();
  const { writeRelayList } = useNostrRelayList();

  const repostMutation = useMutation({
    mutationFn: async (newEvent: Event) => {
      await publishEvent(writeRelayList, newEvent);
      return newEvent;
    },
    onSuccess: (newEvent) => {
      addEventToCache(newEvent);
    },
  });

  const repostEvent = async (event: Event, quote?: string) => {
    if (!userIsLoggedIn || !event) return;

    const relayUrl = writeRelayList[0]; // Use first relay as primary

    const eventTemplate = quote
      ? makeQuoteRepostEvent({ pubkey, content: quote, event, relayUrl })
      : makeRepostEvent({ pubkey, event, relayUrl });

    const signedEvent = await signEvent(eventTemplate);
    if (signedEvent) {
      await repostMutation.mutateAsync(signedEvent);
    }
  };

  return {
    repostEvent,
  };
};
