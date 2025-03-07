import { ActivityItem } from "@/components";
import {
  fetchPulseFeedEvents,
  getContentMetadataMap,
  getITagFromEvent,
} from "@/utils";
import { getLabeledEvents } from "@/utils/comments";
import { useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";

export const useNostrPulseGlobalFeed = (limit: number = 100) => {
  return useQuery({
    queryKey: ["pulse-global-nostr-events", limit],
    queryFn: async () => {
      const { zapReceipts, labelEvents } = await fetchPulseFeedEvents(limit);
      const contentIds: string[] = [];
      const labeledEventIdMap: Record<string, string> = {};

      const zapRequests: Event[] = [];
      zapReceipts.forEach((zapReceipt) => {
        const [descTag, zapRequest] =
          zapReceipt.tags.find(([tag]) => tag === "description") || [];
        try {
          const parsedZapRequest: Event = JSON.parse(zapRequest);
          zapRequests.push(parsedZapRequest);
        } catch (error) {
          console.log("error parsing zap request for pulse feed", error);
        }
      });

      [...zapRequests, ...labelEvents].forEach((event) => {
        // get the contentId from the right iTag
        const contentId = getITagFromEvent(event);
        // get the event id pointer
        const [_eTag, eventId] = event.tags.find((tag) => tag[0] === "e") || [];
        if (event.kind === 1985 && eventId && contentId) {
          contentIds.push(contentId);
          // map the label event id pointer to the content id
          labeledEventIdMap[eventId] = contentId;
        } else if (event.kind === 9734 && contentId) {
          contentIds.push(contentId);
          // map the zap request event id to the content id
          labeledEventIdMap[event.id] = contentId;
        }
      });

      const [metadataMap, labeledEvents] = await Promise.all([
        getContentMetadataMap(contentIds),
        getLabeledEvents(labelEvents),
      ]);

      const allEvents = [...zapRequests, ...labeledEvents];
      return allEvents.map<ActivityItem>((event) => {
        const contentId = labeledEventIdMap[event.id];
        const contentMetadata = metadataMap[contentId];
        const createdAt = new Date(event.created_at * 1000);
        const timestamp = createdAt.toISOString();

        return {
          ...contentMetadata,
          nostrEvent: event,
          type: event.kind === 9734 ? "zap" : "comment",
          timestamp,
          // TODO - support other contentTypes and parentTypes
          parentContentType: "album",
          // these nostr events don't use the below fields
          userId: "",
          picture: "",
          zapAmount: 0,
          name: "",
          description: "",
        };
      });
    },
    staleTime: Infinity,
    retry: false,
  });
};
