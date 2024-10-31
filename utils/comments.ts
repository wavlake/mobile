import { Event, Filter, nip19 } from "nostr-tools";
import { DEFAULT_READ_RELAY_URIS, wavlakeFeedPubkey } from "./shared";
import { pool } from "./relay-pool";

export const getAllCommentEvents = async (
  contentIds: string[],
  limit: number,
) => {
  // skip queries if the list is empty
  if (contentIds.length === 0) {
    return {
      kind1Events: [] as Event[],
      zapReceipts: [] as Event[],
      labelEventPointers: [] as Event[],
    };
  }
  const commentsFilter: Filter = {
    kinds: [1],
    ["#i"]: contentIds.map((id) => `podcast:item:guid:${id}`),
    limit,
  };
  const zapsFilter: Filter = {
    kinds: [9735],
    ["#i"]: contentIds.map((id) => `podcast:item:guid:${id}`),
    limit,
  };
  const labelEventFilter: Filter = {
    kinds: [1985],
    ["#i"]: contentIds.map((id) => `podcast:item:guid:${id}`),
    limit,
    authors: [wavlakeFeedPubkey],
  };

  const [kind1Events, zapReceipts, labelEventPointers] = await Promise.all([
    pool.querySync(DEFAULT_READ_RELAY_URIS, commentsFilter),
    pool.querySync(DEFAULT_READ_RELAY_URIS, zapsFilter),
    pool.querySync(DEFAULT_READ_RELAY_URIS, labelEventFilter),
  ]);

  return {
    kind1Events,
    zapReceipts,
    labelEventPointers,
  };
};

export const getLabeledEvents = async (labelEvents: Event[]) => {
  const labeledEventIds: string[] = [];
  labelEvents.forEach((event) => {
    const [eTag, eventId] = event.tags.find((tag) => tag[0] === "e") || [];
    if (!eventId) return;
    labeledEventIds.push(eventId);
  });

  // skip query if the list is empty
  if (labeledEventIds.length === 0) {
    return [];
  }

  return pool.querySync(DEFAULT_READ_RELAY_URIS, {
    ids: labeledEventIds,
  });
};

// in addition to zapRequests being published with a comment, sometimes a duplicated kind 1 is created, which quotes the original zap receipt.
// this function will deduplicate these kind 1s and zaps
// it also pulls the zap request out of the receipts
export const deduplicateEvents = (
  kind1Events: Event[],
  zapReceipts: Event[],
  labelEventComments: Event[],
) => {
  const dedupedCommentMap = new Map<string, Event>();

  labelEventComments.forEach((labelEventComment) => {
    dedupedCommentMap.set(labelEventComment.id, labelEventComment);
  });

  kind1Events.forEach((kind1Event) => {
    const eventPointer = kind1Event.content.match(/nostr:(\w+)/);
    if (eventPointer) {
      const neventPointer = eventPointer[1];
      const isValid = neventPointer?.slice(0, 7) === "nevent1";
      // TODO validate the eventPointer using nostr-tools after updating
      // const isValid = nip19.isNEvent()
      if (!isValid) {
        console.log("found invalid event pointer", eventPointer);
        return;
      }

      const { type, data } = nip19.decode(neventPointer);
      if (type === "nevent") {
        dedupedCommentMap.set(data.id, kind1Event);
      }
    }
  });

  // prefer the zap request over the kind 1 and label event
  // if the event already exists in the map, it will be overwritten by the zap
  zapReceipts.forEach((receipt) => {
    const [descTag, zapRequest] =
      receipt.tags.find(([tag]) => tag === "description") || [];
    try {
      const parsedZapRequest: Event = JSON.parse(zapRequest);
      // save it under the receipt id so we can deduplicate using kind 1 eventPointers
      dedupedCommentMap.set(receipt.id, parsedZapRequest);
    } catch (error) {
      console.log("error parsing zap request", error);
      console.log("zap receipt event id", receipt.id);
      return undefined;
    }
  });

  return Array.from(dedupedCommentMap.values());
};

export const removeCensoredContent = (event: Event) => {
  const censoredRegexList = [
    // any wavlake.com links
    /(?:\n\n)?(?:https?:\/\/)?(?:www\.)?wavlake\.com(?:\/\S*)?/g,
    // any fountain.fm links
    // /(?:\n\n)?(?:https?:\/\/)?(?:www\.)?wavlake\.com(?:\/\S*)?/g,
    // nostr event quotes
    // the mobile app publishes a kind 1 event that quotes the zap receipt event
    /(?:\n\n)?nostr:(\w+)/g,
  ];
  // remove censored content from event.content string
  const content = censoredRegexList.reduce((acc, regex) => {
    return acc.replace(regex, "");
  }, event.content);

  return {
    ...event,
    content,
  } as Event;
};

const wavlakeTrendingBot =
  "3e0767c6c5174095658a54a9fe23d6974bc3b4de2f72452b474d0682bf6365f0";
export const isNotCensoredAuthor = (event: Event) => {
  const censoredAuthors = [wavlakeFeedPubkey, wavlakeTrendingBot];
  return !censoredAuthors.includes(event.pubkey);
};
