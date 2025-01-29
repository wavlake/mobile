import {
  signEvent,
  publishEvent,
  saveCommentEventId,
  getITagFromEvent,
} from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useAuth } from "./useAuth";
import { nostrQueryKeys, useNostrEvents } from "@/providers/NostrEventProvider";

const makeKind1Event = (
  pubkey: string,
  content: string,
  tags: string[][] = [],
) => {
  return {
    kind: 1,
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content,
  };
};

export const usePublishComment = () => {
  const { cacheEventById } = useNostrEvents();
  const queryClient = useQueryClient();
  const { pubkey, userIsLoggedIn } = useAuth();
  const { writeRelayList } = useNostrRelayList();
  const nostrCommentMutation = useMutation({
    mutationFn: async (newCommentEvent: Event) => {
      await publishEvent(writeRelayList, newCommentEvent);
      return newCommentEvent;
    },
  });

  const save = async (
    content: string,
    zapRequestEventId: string,
    customTags?: string[][],
  ) => {
    if (!userIsLoggedIn) {
      return;
    }

    const event = await signEvent(makeKind1Event(pubkey, content, customTags));
    return new Promise<void>(async (resolve, reject) => {
      if (event) {
        nostrCommentMutation
          .mutateAsync(event)
          .then(async () => {
            // save the event to the cache so we dont need to fetch it
            cacheEventById(event);
            const contentId = getITagFromEvent(event);

            if (contentId) {
              const queryKey = nostrQueryKeys.contentComments(contentId);
              // manually add this new event ID to the cache
              const oldCache = queryClient.getQueryData(queryKey) as string[];
              queryClient.setQueryData(queryKey, [...oldCache, event.id]);
            }

            // save event id to catalog db
            await saveCommentEventId(event.id, zapRequestEventId);
            // TODO
            // update the relevant album and track cache, based on the customTags
            // add in the new comment ID to the cache
            // BLOCKED: cant work backwards from custom album id in feed/i tags to the actual album ID
            // need to fix the IDs or create a mapping table and look it up
            resolve();
          })
          .catch((error: any) => {
            console.error(error);
            reject(error);
          });
      }
    });
  };

  return { save, isSaving: nostrCommentMutation.isPending };
};
