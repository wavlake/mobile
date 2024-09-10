import { DEFAULT_READ_RELAY_URIS, pool } from ".";
import { Event, nip19 } from "nostr-tools";

export const getAllCommentEvents = async (contentIds: string[]) => {
  if (contentIds.length === 0) {
    return {
      kind1Events: [] as Event[],
      zapReceipts: [] as Event[],
      labelEventComments: [] as Event[],
    };
  }
  const commentsFilter = {
    kinds: [1],
    ["#i"]: contentIds.map((id) => `podcast:item:guid:${id}`),
    limit: 100,
  };
  const zapsFilter = {
    kinds: [9735],
    ["#i"]: contentIds.map((id) => `podcast:item:guid:${id}`),
    limit: 100,
  };
  const labelEventFilter = {
    kinds: [1985],
    ["#i"]: contentIds.map((id) => `podcast:item:guid:${id}`),
    limit: 100,
  };

  const [kind1Events, zapReceipts, labelEvents] = await Promise.all([
    pool.querySync(DEFAULT_READ_RELAY_URIS, commentsFilter),
    pool.querySync(DEFAULT_READ_RELAY_URIS, zapsFilter),
    pool.querySync(DEFAULT_READ_RELAY_URIS, labelEventFilter),
  ]);

  const labelEventCommentIds = labelEvents
    .map((event) => {
      const [eTag, eventId] = event.tags.find((tag) => tag[0] === "e") || [];

      return eventId;
    })
    .filter((id) => id !== undefined);

  const labelEventComments =
    // skip if the filter is empty
    labelEventCommentIds.length > 0
      ? await pool.querySync(DEFAULT_READ_RELAY_URIS, {
          ids: labelEventCommentIds,
        })
      : [];
  return {
    kind1Events,
    zapReceipts,
    labelEventComments,
  };
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

  if (content.length === 0 && event.kind !== 9734) {
    return {
      ...event,
      // todo: efficiently get the npub metadata for the pubkey or the track info for the track tag
      content: `Shared this artist's content`,
    };
  }

  return {
    ...event,
    content,
  } as Event;
};

const wavlakePubkey = process.env.EXPO_PUBLIC_WALLET_SERVICE_PUBKEY ?? "";

export const isNotCensoredAuthor = (event: Event) => {
  const censoredAuthors = [wavlakePubkey];
  return !censoredAuthors.includes(event.pubkey);
};
