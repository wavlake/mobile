import { Event } from "nostr-tools";
import { NostrUserProfile } from "@/utils";
import { msatsToSatsWithCommas } from "../WalletLabel";

export const getCommentText = (
  event: Event,
  npubMetadata?: NostrUserProfile | null,
): string => {
  if (event.content) {
    return formatContent(event.content);
  }

  if (event.kind === 9734) {
    return formatZapAmount(event);
  }

  return formatShareText(npubMetadata);
};

const formatContent = (content: string): string => {
  let formattedContent = content.replace(
    /\n\n(?=https:\/\/wavlake\.com\/track\/[a-f0-9\-]{36}\n\nnostr:nevent1[a-zA-Z0-9]+)/g,
    "",
  );

  return formattedContent.replace(
    /https:\/\/wavlake\.com\/track\/[a-f0-9\-]{36}\n\nnostr:nevent1[a-zA-Z0-9]+/g,
    (match) => match.replace(/\n\n/, " "),
  );
};

const formatZapAmount = (event: Event): string => {
  const amountTag = event.tags.find(([tag]) => tag === "amount");
  if (!amountTag) return "";

  const msatsInt = parseInt(amountTag[1]);
  return isNaN(msatsInt)
    ? ""
    : `Zapped ${msatsToSatsWithCommas(msatsInt)} sats`;
};

const formatShareText = (npubMetadata?: NostrUserProfile | null): string =>
  npubMetadata?.name ? `${npubMetadata.name} shared this artist's content` : "";
