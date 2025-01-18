import { signEvent, publishEvent } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useAuth } from "./useAuth";
import { useToast } from "./useToast";

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

export const usePublishReply = () => {
  const toast = useToast();
  const { pubkey = "" } = useAuth();
  const { writeRelayList } = useNostrRelayList();
  const nostrCommentMutation = useMutation({
    mutationFn: async (newCommentEvent: Event) => {
      await publishEvent(writeRelayList, newCommentEvent);
      return newCommentEvent;
    },
  });

  const save = async (content: string, customTags?: string[][]) => {
    const event = await signEvent(makeKind1Event(pubkey, content, customTags));
    return new Promise<Event>(async (resolve, reject) => {
      if (event) {
        nostrCommentMutation
          .mutateAsync(event)
          .then(async () => {
            toast.show("Reply published");
            resolve(event);
          })
          .catch((error: any) => {
            console.error(error);
            toast.show("Failed to publish reply");
            reject(error);
          });
      }
    });
  };

  return { save, isSaving: nostrCommentMutation.isPending };
};
