import { View, ActivityIndicator } from "react-native";
import { Event } from "nostr-tools";
import { Text } from "../shared/Text";
import { useDecodedProfile, useNostrProfile } from "@/hooks";
import { CommentContent } from "./CommentContent";
import { parseZapRequestFromReceipt } from "@/utils";
import { useNostrEvent } from "@/hooks/useNostrEvent";
import { satsFormatter } from "../WalletLabel";

interface InteractionBaseProps {
  comment: Event;
}

export const ReactionInfo = ({ comment }: InteractionBaseProps) => {
  const { content, tags } = comment;
  const [, eventId] = tags.find(([tag]) => tag === "e") ?? [];

  const { data: event, isLoading } = useNostrEvent(eventId);
  const {
    data: authorProfile,
    isLoading: metadataIsLoading,
    refetch: refetchMetadata,
  } = useDecodedProfile(event?.pubkey);
  return (
    <View style={{ flexDirection: "column", width: "100%", gap: 4 }}>
      <Text>{content ? `Reacted with ${content}` : "Reacted"}</Text>
      <ReactionContent
        isLoading={isLoading}
        event={event}
        authorProfile={authorProfile}
        isPending={metadataIsLoading}
      />
    </View>
  );
};

interface ReactionContentProps {
  isLoading: boolean;
  event?: Event | null;
  authorProfile: any; // Type should match your profile structure
  isPending: boolean;
}

const ReactionContent = ({
  isLoading,
  event,
  authorProfile,
  isPending,
}: ReactionContentProps) => (
  <View
    style={{
      width: "100%",
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      padding: 8,
      borderRadius: 8,
    }}
  >
    {isLoading ? (
      <ActivityIndicator />
    ) : event ? (
      <CommentContent
        npubMetadata={authorProfile}
        metadataIsLoading={isPending}
        comment={event}
      />
    ) : (
      <Text>Event not found</Text>
    )}
  </View>
);

export const ZapInfo = ({ comment }: InteractionBaseProps) => {
  const { receipt, amount } = parseZapRequestFromReceipt(comment);

  if (!receipt || !amount) {
    return <Text>Zapped you</Text>;
  }

  return (
    <View>
      <ZapAmount amount={amount} />
      {receipt.content && <Text>{receipt.content}</Text>}
    </View>
  );
};

const ZapAmount = ({ amount }: { amount: number }) => (
  <View
    style={{
      flexDirection: "row",
      gap: 4,
      alignItems: "center",
    }}
  >
    <Text>Zapped </Text>
    <Text bold>{satsFormatter(amount * 1000)} sats</Text>
  </View>
);
export const Repost = ({ comment }: InteractionBaseProps) => {
  const { tags } = comment;
  const [, eventId, relay] = tags.find(([tag]) => tag === "e") ?? [];
  const { data: event, isLoading } = useNostrEvent(eventId, [relay]);
  const { data: authorProfile, isLoading: metadataIsLoading } =
    useDecodedProfile(event?.pubkey);
  return (
    <View style={{ flexDirection: "column", width: "100%" }}>
      <Text>Reposted 🔁</Text>
      <ReactionContent
        isLoading={isLoading}
        event={event}
        authorProfile={authorProfile}
        isPending={metadataIsLoading}
      />
    </View>
  );
};
