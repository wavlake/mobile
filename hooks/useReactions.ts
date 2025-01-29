import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useNostrRelayList } from "./nostrRelayList";
import { useAuth } from "./useAuth";
import { signEvent, publishEvent, fetchEventReactions } from "@/utils";
import { nostrQueryKeys } from "@/providers/NostrEventProvider";

interface UseReactionsResult {
  reactions: Event[];
  reactToEvent: (reaction: string) => Promise<void>;
  isLoading: boolean;
  error: unknown;
  userReaction: Event | undefined;
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
  const queryClient = useQueryClient();
  const { pubkey, userIsLoggedIn } = useAuth();
  const { writeRelayList } = useNostrRelayList();

  const {
    data: reactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: nostrQueryKeys.eventReactions(event.id),
    queryFn: async () => fetchEventReactions(event),
    enabled: Boolean(event),
  });
  const userReaction = reactions.find((reaction) => reaction.pubkey === pubkey);

  const reactionMutation = useMutation({
    mutationFn: async (newReactionEvent: Event) => {
      await publishEvent(writeRelayList, newReactionEvent);
      return newReactionEvent;
    },
    onSuccess: (newReaction) => {
      queryClient.setQueryData(
        nostrQueryKeys.eventReactions(event.id),
        (old: Event[] = []) => [...old, newReaction],
      );
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
    reactions,
    reactToEvent,
    isLoading,
    error,
    userReaction,
  };
};
