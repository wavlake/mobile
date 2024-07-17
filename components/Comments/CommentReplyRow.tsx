import { View, ViewProps } from "react-native";
import { BasicAvatar } from "../BasicAvatar";
import { Text } from "@/components/Text";
import { Event } from "nostr-tools";
import { useCatalogPubkey } from "@/hooks/nostrProfile/useCatalogPubkey";

interface CommentReplyRow extends ViewProps {
  reply: Event;
}

export const CommentReplyRow = ({ reply }: CommentReplyRow) => {
  const { content, pubkey } = reply;
  const { data: metadata } = useCatalogPubkey(pubkey);
  const { name, picture } = metadata?.metadata || {};

  return (
    <View
      style={{
        marginBottom: 16,
        flexDirection: "row",
        paddingHorizontal: 16,
        display: "flex",
        alignItems: "center",
      }}
    >
      <BasicAvatar uri={picture} pubkey={pubkey} />
      <View style={{ marginLeft: 10, flex: 1 }}>
        {content && <Text bold>{content}</Text>}
      </View>
    </View>
  );
};
