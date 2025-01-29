import { useMutation } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useNostrRelayList } from "./nostrRelayList";
import { useAuth } from "./useAuth";
import { signEvent, publishEvent } from "@/utils";
import { useEventRelatedEvents } from "./useEventRelatedEvents";

interface UseReactionsResult {
  reactToEvent: (reaction: string) => Promise<void>;
}

const makeReactionEvent = (
  pubkey: string,
  eventId: string,
  reaction: string,
  authorPubkey: string,
) => {
  return {
    kind: 7,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["e", eventId],
      ["p", authorPubkey],
    ],
    content: reaction,
  };
};

export const useReactions = (event: Event): UseReactionsResult => {
  const { addEventToCache } = useEventRelatedEvents(event);
  const { pubkey, userIsLoggedIn } = useAuth();
  const { writeRelayList } = useNostrRelayList();

  const reactionMutation = useMutation({
    mutationFn: async (newReactionEvent: Event) => {
      await publishEvent(writeRelayList, newReactionEvent);
      return newReactionEvent;
    },
    onSuccess: (newReaction) => {
      addEventToCache(newReaction);
    },
  });

  const reactToEvent = async (reaction: string) => {
    if (!userIsLoggedIn) return;

    const reactionEvent = await signEvent(
      makeReactionEvent(pubkey, event.id, reaction, pubkey),
    );
    if (reactionEvent) {
      await reactionMutation.mutateAsync(reactionEvent);
    }
  };

  return {
    reactToEvent,
  };
};
